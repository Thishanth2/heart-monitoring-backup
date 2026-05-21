# Cardiac Health Assessment Questionnaire - Testing Guide

## Quick Start

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. Click the **📋 Assessment** button in the top-right of the header

## Test Scenarios

### Scenario 1: Low Risk Assessment
**Steps:**
1. Select "No" for all questions
2. Click Submit

**Expected Result:**
- Score: 0
- Risk Level: 🟢 MONITOR
- Recommendation: "Your current risk profile is low..."

---

### Scenario 2: Moderate Risk Assessment (Score 4-7)
**Steps:**
1. Answer as follows:
   - Chest Pain: "Yes, especially during activity" (weight 2)
   - Pain Spread: "Yes, but unclear pattern" (weight 1)
   - Shortness of Breath: "Yes, during activity" (weight 2)
   - Heart Racing: "No" (weight 0)
   - Dizzy/Faint: "Yes, fatigue" (weight 1)
   - Symptoms Worsen: "No" (weight 1)
2. Click Submit

**Expected Result:**
- Score: 7
- Risk Level: 🟡 URGENT
- Recommendation: "Consult a doctor as soon as possible..."
- No red flag triggered

---

### Scenario 3: High Risk with Red Flag (Chest Pain at Rest)
**Steps:**
1. Answer as follows:
   - Chest Pain: "Yes, even at rest" (weight 3, RED FLAG)
   - Any other answer
2. Click Submit

**Expected Result:**
- Score: 3+ (depending on other answers)
- Risk Level: 🔴 IMMEDIATE (due to red flag)
- Red Flag Alert: "⚠️ Critical Symptoms Detected"
- Recommendation: "IMMEDIATE TREATMENT REQUIRED..."

---

### Scenario 4: Red Flag - Pain Spread to Left Arm/Jaw
**Steps:**
1. Answer as follows:
   - Chest Pain: "Mild or occasional discomfort" (weight 1)
   - Pain Spread: "Yes (especially left arm/jaw)" (weight 3, RED FLAG)
   - Other answers: "No"
2. Click Submit

**Expected Result:**
- Risk Level: 🔴 IMMEDIATE
- Reason: Red flag detected for pain radiation pattern

---

### Scenario 5: Red Flag - Shortness of Breath at Rest
**Steps:**
1. Answer as follows:
   - Chest Pain: "No"
   - Pain Spread: "No pain at all"
   - Shortness of Breath: "Yes, even at rest" (weight 3, RED FLAG)
   - Other answers: "No"
2. Click Submit

**Expected Result:**
- Risk Level: 🔴 IMMEDIATE
- Reason: Critical dyspnea symptom detected

---

### Scenario 6: Red Flag - Heart Racing with Dizziness/Fainting
**Steps:**
1. Answer as follows:
   - First 3 questions: "No"
   - Heart Racing: "Yes, with dizziness/fainting" (weight 3, RED FLAG)
   - Other answers: "No"
2. Click Submit

**Expected Result:**
- Risk Level: 🔴 IMMEDIATE
- Reason: Serious arrhythmia with syncope symptoms

---

### Scenario 7: Red Flag - Dizziness/Near Fainting
**Steps:**
1. Answer as follows:
   - First 4 questions: "No"
   - Dizzy/Faint: "Yes, dizziness or near fainting" (weight 3, RED FLAG)
   - Symptoms Worsen: "No"
2. Click Submit

**Expected Result:**
- Risk Level: 🔴 IMMEDIATE
- Reason: Syncope/pre-syncope detected

---

### Scenario 8: High Score (≥8) Without Red Flag
**Steps:**
1. Answer as follows:
   - Chest Pain: "Yes, especially during activity" (weight 2)
   - Pain Spread: "Yes, but unclear pattern" (weight 1)
   - Shortness of Breath: "Yes, during activity" (weight 2)
   - Heart Racing: "Yes - occasionally" (weight 1)
   - Dizzy/Faint: "Yes, fatigue" (weight 1)
   - Symptoms Worsen: "Yes" (weight 3)
   - Total: 2+1+2+1+1+3 = 10
   - Click Submit

**Expected Result:**
- Score: 10
- Risk Level: 🔴 IMMEDIATE (due to score ≥8)
- Recommendation: "Seek immediate medical attention..."

---

### Scenario 9: Form Validation
**Steps:**
1. Click "Next" on a question without selecting an answer

**Expected Result:**
- Error message appears: "Please select an answer before continuing"
- Form prevents progression until an answer is selected

---

### Scenario 10: Navigation and Reset
**Steps:**
1. Complete a full questionnaire
2. View results
3. Click "Start New Assessment"
4. Go back using "Previous" buttons
5. Click "Back to Dashboard"

**Expected Result:**
- Form resets properly
- Navigation works smoothly
- Previous button takes you to prior questions
- Back button takes you home

---

## Scoring Reference Table

| Question | Answer | Weight |
|----------|--------|--------|
| Chest Pain | No | 0 |
| | Mild or occasional | 1 |
| | During activity | 2 |
| | At rest | 3 ⚠️ |
| Pain Spread | None | 0 |
| | Unclear | 1 |
| | Left arm/jaw | 3 ⚠️ |
| Shortness of Breath | No | 0 |
| | During activity | 2 |
| | At rest | 3 ⚠️ |
| Heart Racing | No | 0 |
| | Occasionally | 1 |
| | With dizziness | 3 ⚠️ |
| Dizzy/Faint | No | 0 |
| | Fatigue | 1 |
| | Fainting | 2 ⚠️ |
| | Dizziness | 3 ⚠️ |
| Symptoms Worsen | No | 1 |
| | Even at rest | 2 |
| | Yes (exertion) | 3 ⚠️ |

⚠️ = Red Flag (automatic IMMEDIATE classification)

---

## UI/UX Testing

### Mobile Responsive
- [ ] Test on iPhone 12 (390px width)
- [ ] Test on iPad (768px width)
- [ ] Test on Android phone (375px width)

### Accessibility
- [ ] Test with keyboard navigation (Tab key)
- [ ] Test screen reader (NVDA, JAWS)
- [ ] Check color contrast (WCAG AA)

### Browser Compatibility
- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)

---

## Component Testing Checklist

### PatientInfoForm
- [ ] Name input accepts text
- [ ] NIC input accepts alphanumeric
- [ ] Age input accepts numbers only
- [ ] Validation errors display
- [ ] Submit button works
- [ ] Error messages clear when user types

### QuestionnaireForm
- [ ] Radio buttons work
- [ ] Progress bar updates correctly
- [ ] Previous button goes back
- [ ] Next button progresses forward
- [ ] All 6 questions are present
- [ ] Final question shows "Submit" instead of "Next"

### ResultsScreen
- [ ] Patient info displays correctly
- [ ] Score shows correctly
- [ ] Risk level badge displays with correct color
- [ ] Recommendations text is appropriate for risk level
- [ ] Red flag alert shows when triggered
- [ ] Print button works
- [ ] "Start New Assessment" resets form

---

## Known Limitations

1. **No Database Persistence**: Currently saves data in memory only. Add database integration if needed.

2. **No Authentication**: Anyone can access the questionnaire. Add user authentication if needed.

3. **No Email Notifications**: Results aren't automatically sent to doctors or patients.

4. **No History**: Previous assessments aren't tracked or retrievable.

5. **No Admin Dashboard**: No way to view aggregate results or patient history.

---

## Bug Report Template

If you find issues, please document:

```
**Issue Title**: [Concise description]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Screen Size: [Mobile/Tablet/Desktop]

**Screenshots/Videos**:
[Attach if possible]
```

---

## Performance Testing

- [ ] Initial load time < 2 seconds
- [ ] Form submission < 500ms
- [ ] No console errors
- [ ] Memory usage stays stable
- [ ] Navigation between steps is smooth

---

## Compliance Testing

- [ ] Medical disclaimer is displayed
- [ ] No medical advice is given in recommendations
- [ ] Results state to consult healthcare professionals
- [ ] All red-flag answers are properly identified
- [ ] Scoring logic matches specification exactly

---

**Last Updated**: April 2026
**Tested By**: QA Team
**Status**: ✅ Ready for Testing
