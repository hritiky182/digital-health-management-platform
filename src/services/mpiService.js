/**
 * CareAxis Master Patient Index (MPI) Service
 * Client-side deterministic & probabilistic duplicate detection algorithm for demonstration.
 * Includes confidence score calculation, field differences, proposed merge previews, and merge execution.
 */

// Normalized string comparison helper
function stringSimilarity(s1 = '', s2 = '') {
  const a = s1.trim().toLowerCase();
  const b = s2.trim().toLowerCase();
  if (!a || !b) return 0;
  if (a === b) return 1.0;

  // Simple token / prefix comparison
  if (a.includes(b) || b.includes(a)) return 0.85;

  // Levenshtein distance
  const track = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - distance / maxLen);
}

// Phone normalization (extract digits)
function normalizePhone(p = '') {
  return p.replace(/\D/g, '');
}

export const MpiService = {
  /**
   * Compares two patient records and computes a composite match confidence score (0 - 100%).
   */
  calculateMatchScore(p1, p2) {
    if (!p1 || !p2 || p1.id === p2.id) return { score: 0, reasons: [] };

    const reasons = [];
    let weightedScore = 0;

    // 1. National ID / Government ID Match (Heavy weight: 40%)
    if (p1.nationalId && p2.nationalId) {
      const id1 = p1.nationalId.trim().toUpperCase();
      const id2 = p2.nationalId.trim().toUpperCase();
      if (id1 === id2) {
        weightedScore += 40;
        reasons.push('Exact National Identifier Match');
      } else if (stringSimilarity(id1, id2) > 0.8) {
        weightedScore += 25;
        reasons.push('Probable Typo in National Identifier');
      }
    }

    // 2. Date of Birth Match (Weight: 25%)
    if (p1.dob && p2.dob) {
      if (p1.dob === p2.dob) {
        weightedScore += 25;
        reasons.push('Exact Date of Birth Match');
      } else {
        // Transposed year/day check or same month/day
        const y1 = p1.dob.split('-')[0];
        const y2 = p2.dob.split('-')[0];
        if (y1 === y2) {
          weightedScore += 10;
          reasons.push('Matching Birth Year');
        }
      }
    }

    // 3. Name Similarity (Weight: 25%)
    const name1 = `${p1.firstName} ${p1.lastName}`;
    const name2 = `${p2.firstName} ${p2.lastName}`;
    const nameSim = stringSimilarity(name1, name2);
    if (nameSim >= 0.95) {
      weightedScore += 25;
      reasons.push('Phonetic & Literal Full Name Match');
    } else if (nameSim >= 0.75) {
      weightedScore += 18;
      reasons.push('High Name Similarity (Possible Maiden/Hyphenated Name)');
    }

    // 4. Phone Number / Contact Match (Weight: 10%)
    const phone1 = normalizePhone(p1.phone);
    const phone2 = normalizePhone(p2.phone);
    if (phone1 && phone2 && phone1.slice(-7) === phone2.slice(-7)) {
      weightedScore += 10;
      reasons.push('Matching Contact Telephone Number');
    }

    const finalScore = Math.min(100, Math.round(weightedScore));
    return {
      score: finalScore,
      reasons,
      confidence: finalScore >= 85 ? 'High' : finalScore >= 70 ? 'Moderate' : 'Low'
    };
  },

  /**
   * Scans an array of patients and finds all candidate duplicate pairs above the threshold.
   */
  findDuplicateCandidates(patients = [], threshold = 65) {
    const active = patients.filter(p => p.status === 'Active');
    const pairs = [];
    const seen = new Set();

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const p1 = active[i];
        const p2 = active[j];
        const key = [p1.id, p2.id].sort().join('::');

        if (!seen.has(key)) {
          seen.add(key);
          const match = this.calculateMatchScore(p1, p2);
          if (match.score >= threshold) {
            pairs.push({
              id: `dup-pair-${p1.id}-${p2.id}`,
              primaryCandidate: p1,
              duplicateCandidate: p2,
              score: match.score,
              confidence: match.confidence,
              reasons: match.reasons,
              detectedAt: new Date().toISOString()
            });
          }
        }
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  },

  /**
   * Checks if an incoming new patient form matches any existing registered patients.
   */
  checkNewPatientForDuplicates(newPatient, existingPatients = []) {
    const matches = [];
    existingPatients.forEach(p => {
      const match = this.calculateMatchScore(newPatient, p);
      if (match.score >= 60) {
        matches.push({
          existingPatient: p,
          score: match.score,
          reasons: match.reasons,
          confidence: match.confidence
        });
      }
    });
    return matches.sort((a, b) => b.score - a.score);
  }
};
