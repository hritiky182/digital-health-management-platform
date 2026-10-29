/**
 * CareAxis Interoperability & FHIR Transformation Service
 * Produces standards-compliant HL7 FHIR Release 4 JSON resources and HL7 v2.5 pipe-and-hat messages.
 */

export const FhirService = {
  /**
   * Transforms a CareAxis Patient into a FHIR R4 Patient resource.
   */
  toFhirPatient(patient) {
    if (!patient) return null;
    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
      },
      identifier: [
        {
          use: 'official',
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical Record Number' }] },
          system: 'urn:oid:careaxis.demo.mrn',
          value: patient.mrn
        },
        {
          use: 'secondary',
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'NI', display: 'National Unique Patient Identifier' }] },
          system: 'urn:oid:careaxis.demo.upid',
          value: patient.upid
        }
      ],
      active: patient.status === 'Active',
      name: [
        {
          use: 'official',
          family: patient.lastName,
          given: [patient.firstName, patient.middleName].filter(Boolean)
        }
      ],
      telecom: [
        { system: 'phone', value: patient.phone, use: 'mobile' },
        { system: 'email', value: patient.email, use: 'home' }
      ],
      gender: patient.gender?.toLowerCase() || 'unknown',
      birthDate: patient.dob,
      address: [
        {
          use: 'home',
          line: [patient.address?.street].filter(Boolean),
          city: patient.address?.city,
          district: patient.address?.district,
          postalCode: patient.address?.postalCode,
          country: 'Demo State'
        }
      ],
      managingOrganization: {
        reference: `Organization/${patient.primaryFacilityId}`,
        display: 'CareAxis Health Network Facility'
      }
    };
  },

  /**
   * Transforms an Encounter into a FHIR R4 Encounter resource.
   */
  toFhirEncounter(encounter, patient) {
    if (!encounter) return null;
    return {
      resourceType: 'Encounter',
      id: encounter.id,
      status: encounter.status === 'Completed' ? 'finished' : 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory'
      },
      subject: {
        reference: `Patient/${encounter.patientId}`,
        display: encounter.patientName
      },
      participant: [
        {
          individual: {
            display: encounter.providerName
          }
        }
      ],
      period: {
        start: encounter.visitDate
      },
      reasonCode: encounter.diagnoses?.map(d => ({
        coding: [{
          system: 'http://hl7.org/fhir/sid/icd-10',
          code: d.code,
          display: d.description
        }]
      })) || [],
      serviceProvider: {
        reference: `Organization/${encounter.facilityId}`,
        display: encounter.facilityName
      }
    };
  },

  /**
   * Generates a FHIR R4 Bundle containing Patient, Encounter, Observations, and MedicationRequests.
   */
  generatePatientFhirBundle(patient, encounters = [], prescriptions = [], labs = []) {
    const fhirPatient = this.toFhirPatient(patient);
    const entries = [
      {
        fullUrl: `urn:uuid:${patient.id}`,
        resource: fhirPatient
      }
    ];

    encounters.forEach(enc => {
      entries.push({
        fullUrl: `urn:uuid:${enc.id}`,
        resource: this.toFhirEncounter(enc, patient)
      });
    });

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries
    };
  },

  /**
   * Generates a simulated HL7 v2.5 ADT^A08 (Patient Information Update) message.
   */
  generateHl7v2AdtMessage(patient) {
    const now = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const dobFormatted = (patient.dob || '').replace(/-/g, '');
    const msh = `MSH|^~\\&|CAREAXIS_EHR|FAC_${patient.primaryFacilityId}|REGIONAL_HIE|NAT_HUB|${now}||ADT^A08^ADT_A08|MSG${Date.now()}|P|2.5`;
    const evn = `EVN|A08|${now}`;
    const pid = `PID|1||${patient.mrn}^^^CAREAXIS^MR~${patient.upid}^^^NAT_UPID^NI||${patient.lastName}^${patient.firstName}^${patient.middleName || ''}||${dobFormatted}|${patient.gender === 'Female' ? 'F' : 'M'}|||${patient.address?.street || ''}^^${patient.address?.city || ''}^^${patient.address?.postalCode || ''}||${patient.phone}||||||||||||||||`;
    const pv1 = `PV1|1|O|AMB^CLINIC^01||||DOC01^Chen^Sarah^K||||||||||||V${Date.now()}|||||||||||||||||||||||||${now}`;

    return [msh, evn, pid, pv1].join('\r\n');
  }
};
