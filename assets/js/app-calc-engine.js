/* GRADEO Calculation Engine v2.0 */

const GradeMap = {
  'S': 10, 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
};

window.calculateSGPA = function(subjects) {
  let totalCredits = 0;
  let totalPoints = 0;
  
  subjects.forEach(sub => {
    const gradePoint = GradeMap[sub.grade] || 0;
    totalPoints += (gradePoint * sub.credits);
    totalCredits += sub.credits;
  });
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
};

window.exportGradeCard = function(data) {
  /* Logic for PDF export */
  console.log('Exporting grade card...', data);
  window.print();
};
