# Cardiac Health Assessment Questionnaire

A comprehensive web-based cardiac health assessment questionnaire integrated into the Heart Health Monitoring System.

## Features

✅ **Patient Information Collection**
- Patient name, NIC number, and age
- Form validation with error handling

✅ **Interactive Questionnaire**
- 6 cardiac symptom assessment questions
- Progressive questionnaire flow (1 question at a time)
- Progress bar showing completion status

✅ **Risk Assessment Scoring**
- Weighted scoring system (0-18 points max)
- Red-flag detection for critical symptoms
- 4-level risk classification:
  - 🔴 **IMMEDIATE**: Score ≥8 or red flag detected → Seek immediate emergency care
  - 🟡 **URGENT**: Score 4-7 → Consult doctor as soon as possible
  - 🟡 **CONSULTATION**: Score 1-3 → Schedule doctor's appointment
  - 🟢 **MONITOR**: Score 0 → Monitor health, no immediate action

✅ **Results Screen**
- Risk level with color-coded indicators
- Patient information summary
- Actionable medical recommendations
- Print functionality for results

## Questions Included

1. **Chest Pain/Discomfort** - Assesses frequency and severity
2. **Pain Spread** - Checks for radiation patterns
3. **Shortness of Breath** - Evaluates dyspnea
4. **Heart Racing/Irregularity** - Detects arrhythmia symptoms
5. **Dizziness/Fatigue** - Assesses circulatory symptoms
6. **Symptom Pattern** - Checks exertion-related symptoms

## Scoring Weights

Each question has weighted answers:

| Question | Answer Options | Weights |
|----------|---|---|
| Chest Pain | No / Mild / During Activity / At Rest | 0 / 1 / 2 / 3 |
| Pain Spread | None / Unclear / Left Arm/Jaw | 0 / 1 / 3 |
| Shortness of Breath | No / During Activity / At Rest | 0 / 2 / 3 |
| Heart Racing | No / Occasionally / With Dizziness | 0 / 1 / 3 |
| Dizzy/Faint | No / Fatigue / Fainting / Dizziness | 0 / 1 / 2 / 3 |
| Symptoms Worsen | No / Even at Rest / Yes with Exertion | 1 / 2 / 3 |

## Red Flag Answers

Any of these answers trigger IMMEDIATE risk level:
- "Yes, even at rest" (Chest pain)
- "Yes (especially left arm/jaw)" (Pain spread)
- "Yes, even at rest" (Shortness of breath)
- "Yes, with dizziness/fainting" (Heart racing)
- "Yes, dizziness or near fainting" or "Yes, fainting" (Dizzy/faint)
- "Yes" (Symptoms worsen with exertion)

## File Structure

```
app/
├── questionnaire.tsx           # Main questionnaire page component
├── components/
│   ├── PatientInfoForm.tsx    # Patient info collection form
│   ├── QuestionnaireForm.tsx  # Progressive questionnaire flow
│   ├── ResultsScreen.tsx      # Risk assessment results
│   └── QuestionnaireFlow.tsx  # Flow manager (alternative)
└── page.tsx                   # Updated home page with Assessment link
```

## Usage

### For Patients

1. Click the **📋 Assessment** button on the home page
2. Enter your name, NIC number, and age
3. Answer each cardiac symptom question honestly
4. Review your risk assessment results
5. Follow the medical recommendations provided

### For Developers

#### Testing the Questionnaire

```bash
npm run dev
# Navigate to http://localhost:3000
# Click "Assessment" button
```

#### Example Test Cases

**Test Case 1: Low Risk**
- All answers: "No"
- Expected: Score 0, Status 🟢 MONITOR

**Test Case 2: Moderate Risk**
- Mixed answers with some symptoms
- Expected: Score 4-7, Status 🟡 URGENT

**Test Case 3: High Risk**
- Select "Yes, even at rest" for chest pain
- Expected: Score ≥8, Status 🔴 IMMEDIATE (Red flag)

## MongoDB Integration (Future)

The `.env.local` file includes MongoDB Atlas configuration:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/heart-monitoring?retryWrites=true&w=majority
```

To enable database persistence:

1. Create a MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and get connection string
3. Update `.env.local` with your credentials
4. Uncomment MongoDB storage code in the questionnaire page

## API Endpoint (Future Implementation)

Once MongoDB is configured, the following endpoint will be available:

```
POST /api/questionnaire/submit
Content-Type: application/json

Request body:
{
  "patientName": "John Doe",
  "nic": "123-45-6789",
  "age": 45,
  "answers": {
    "chestPain": "Yes, even at rest",
    "painSpread": "No pain at all",
    ...
  }
}

Response:
{
  "patientName": "John Doe",
  "totalScore": 8,
  "hasRedFlag": true,
  "riskLevel": "IMMEDIATE",
  "recommendations": "...",
  "submittedAt": "2024-04-08T15:04:34.814Z"
}
```

## Security & Privacy

⚠️ **Important**: This questionnaire is for informational purposes only. Always consult with qualified healthcare professionals for:
- Proper medical diagnosis
- Treatment recommendations
- Emergency situations

All patient data should be:
- Encrypted in transit (HTTPS)
- Encrypted at rest (MongoDB encryption)
- HIPAA/GDPR compliant
- Handled according to healthcare data privacy regulations

## Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers supported

## Performance

- No external API calls (scoring done client-side)
- Fast form submission
- Responsive on all screen sizes
- Accessible (WCAG 2.1 AA compliant)

## Future Enhancements

- [ ] MongoDB persistence of results
- [ ] API endpoint for data storage
- [ ] Results history per patient
- [ ] Export to PDF
- [ ] Email results to doctor
- [ ] Multi-language support
- [ ] Admin dashboard for results analysis
- [ ] Integration with EHR systems
