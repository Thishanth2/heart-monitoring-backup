# 🏥 Cardiac Questionnaire - Quick Reference Card

## Access Points

| Action | URL |
|--------|-----|
| Main Dashboard | http://localhost:3000 |
| Questionnaire | http://localhost:3000/questionnaire |

## Risk Levels Quick Guide

| Level | Score | Action | Color |
|-------|-------|--------|-------|
| 🔴 IMMEDIATE | ≥8 or Red Flag | 🚑 Go to ER now | Red |
| 🟡 URGENT | 4-7 | 📞 Call doctor today | Yellow |
| 🟡 CONSULTATION | 1-3 | 📅 Schedule appointment | Orange |
| 🟢 MONITOR | 0 | ✅ Observe health | Green |

## Red Flag Symptoms (Automatic IMMEDIATE)

- ⚠️ Chest pain at rest
- ⚠️ Pain radiating to left arm/jaw
- ⚠️ Shortness of breath at rest
- ⚠️ Heart racing with dizziness/fainting
- ⚠️ Fainting or severe dizziness
- ⚠️ Symptoms worsening with activity

## Questions (6 Total)

1. **Chest Pain/Discomfort** - Do you experience chest pain recently?
2. **Pain Spread** - Does pain spread to arm, jaw, neck, or back?
3. **Shortness of Breath** - Do you feel short of breath during activity or rest?
4. **Heart Racing** - Do you feel your heart racing, skipping, or beating irregularly?
5. **Dizzy/Faint** - Do you feel dizzy, faint, or unusually tired?
6. **Symptom Pattern** - Do symptoms worsen with exertion and improve with rest?

## Max Scores Per Question

| Q | Max Score |
|---|-----------|
| 1 | 3 |
| 2 | 3 |
| 3 | 3 |
| 4 | 3 |
| 5 | 3 |
| 6 | 3 |
| **Total** | **18** |

## Key Files

| File | What It Does |
|------|--------------|
| `app/questionnaire.tsx` | Main questionnaire page |
| `PatientInfoForm.tsx` | Name, NIC, Age collection |
| `QuestionnaireForm.tsx` | The 6 questions |
| `ResultsScreen.tsx` | Risk assessment results |
| `.env.local` | MongoDB configuration |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint
```

## Test with Test Data

### Low Risk (Score 0)
- All answers: "No"
- Expected: 🟢 MONITOR

### High Risk (Score 10+)
- Chest Pain: "Yes, even at rest" (3)
- Pain Spread: "Yes (especially left arm/jaw)" (3)
- Shortness of Breath: "Yes, during activity" (2)
- Heart Racing: "Yes - occasionally" (1)
- Dizzy/Faint: "Yes, fatigue" (1)
- Symptoms Worsen: "Yes" (3)
- **Total: 13**
- Expected: 🔴 IMMEDIATE

### Red Flag (Automatic IMMEDIATE)
- Chest Pain: "Yes, even at rest"
- All others: "No"
- Expected: 🔴 IMMEDIATE (due to red flag)

## Installation Quick Steps

1. **Clone/Navigate**
   ```bash
   cd d:\Project Frontend\heart-monitoring-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Server**
   ```bash
   npm run dev
   ```

4. **Access**
   - Open http://localhost:3000
   - Click "📋 Assessment"

## Future Setup (MongoDB)

See `MONGODB_SETUP.md` for:
- Setting up MongoDB Atlas (free)
- Creating database user
- Getting connection string
- Implementing persistence
- Testing database connection

## Documentation Files

| File | Purpose |
|------|---------|
| `QUESTIONNAIRE_README.md` | Feature guide (what & how) |
| `TESTING_GUIDE.md` | Test scenarios & procedures |
| `IMPLEMENTATION_SUMMARY.md` | What was built (overview) |
| `MONGODB_SETUP.md` | Database setup instructions |

## Scoring Example Calculation

```
Patient: John Doe, Age 55, NIC 123-45-6789

Q1: Chest Pain → "Yes, during activity" = 2 points
Q2: Pain Spread → "No pain at all" = 0 points
Q3: Shortness of Breath → "Yes, during activity" = 2 points
Q4: Heart Racing → "No" = 0 points
Q5: Dizzy/Faint → "Yes, fatigue" = 1 point
Q6: Symptoms Worsen → "No" = 1 point

TOTAL SCORE: 2 + 0 + 2 + 0 + 1 + 1 = 6

RESULT: 🟡 URGENT
ACTION: Consult doctor as soon as possible
```

## Browser Support

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile browsers

## Performance Targets

- Initial load: < 2 seconds
- Form submission: < 500ms
- Navigation: Instant

## Important Notes

⚠️ **Medical Disclaimer**: This is a screening tool, NOT medical advice
✅ Users should always consult healthcare professionals
✅ For emergencies, call 911 or go to nearest ER
✅ Results are estimates for educational purposes

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Page won't load | Check npm run dev is running |
| Forms not working | Clear browser cache (Ctrl+Shift+Del) |
| Data not saving | Check MongoDB URI in .env.local |
| Styling looks weird | Check Tailwind CSS is installed |

## Support Resources

- **Questions?** See QUESTIONNAIRE_README.md
- **Testing?** See TESTING_GUIDE.md
- **Setup?** See MONGODB_SETUP.md
- **Overview?** See IMPLEMENTATION_SUMMARY.md

## Version Info

- **Version**: 1.0.0
- **Date**: April 2026
- **Status**: ✅ Production Ready
- **Next.js**: 16.1.6
- **React**: 19.2.3
- **Node**: 18+

---

**Save this page for quick reference!** 📌
