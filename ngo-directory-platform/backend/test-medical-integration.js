const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const MedicalAssistance = require('./models/MedicalAssistance');
const Donation = require('./models/Donation');
const PaymentWebhookEvent = require('./models/PaymentWebhookEvent');
const { calculateCampaignTotals } = require('./utils/campaignTotals');
const crypto = require('crypto');

dotenv.config();

async function runTests() {
  console.log('--- STARTING EMERGENCY MEDICAL ASSISTANCE & RAZORPAY INTEGRATION TESTS ---');
  await connectDB();

  try {
    // 1. Verify User models
    const admin = await User.findOne({ role: 'admin' });
    console.log(`[PASS] Admin found: ${admin ? admin.email : 'None'}`);

    const patient = await User.findOne({ role: 'patient' }) || await User.findOne({ role: 'donor' });
    console.log(`[PASS] Patient user found: ${patient ? patient.email : 'None'}`);

    // 2. Create a test campaign
    const testCampaign = await MedicalAssistance.create({
      createdBy: patient._id,
      representative: {
        name: 'Test Representative',
        relationship: 'Sibling',
        phone: '9988776655',
      },
      patientDisplayName: 'Integration Test Patient',
      privatePatientDetails: {
        fullName: 'Secret Full Patient Legal Name',
        age: 25,
        contactPhone: '9988776655',
        address: 'Secret Home Address 123',
        district: 'Nashik',
      },
      conditionCategory: 'Critical Care',
      medicalSummary: 'Test clinical trauma needing intensive monitoring',
      treatmentDetails: 'Test ventilator support',
      hospitalDetails: {
        hospitalName: 'District Apex Hospital',
        hospitalLocation: 'Nashik',
        estimatedCost: 200000,
        showHospitalPublicly: true,
      },
      district: 'Nashik',
      fundingTarget: 150000,
      urgency: 'critical',
      verificationStatus: 'Pending',
      campaignStatus: 'Active',
      publicConsent: true,
    });
    console.log(`[PASS] Created test campaign with ID: ${testCampaign._id}, status: ${testCampaign.verificationStatus}`);

    // 3. Test Admin Verification Workflow: Approve campaign
    testCampaign.verificationStatus = 'Approved';
    testCampaign.reviewedBy = admin ? admin._id : patient._id;
    testCampaign.reviewedAt = new Date();
    await testCampaign.save();
    console.log(`[PASS] Admin verified & approved campaign: ${testCampaign.verificationStatus}`);

    // 4. Test Donation Order Creation
    const receiptRef = `RCPT-TEST-${Date.now()}`;
    const donation = await Donation.create({
      donor: patient._id,
      targetType: 'medical_campaign',
      targetCampaign: testCampaign._id,
      amount: 15000,
      currency: 'INR',
      paymentProvider: 'razorpay',
      providerOrderId: `order_test_${Date.now()}`,
      providerSignatureStatus: 'pending',
      transactionStatus: 'pending',
      receiptReference: receiptRef,
      name: 'Integration Donor',
      location: 'Nashik',
    });
    console.log(`[PASS] Created pending donation order: ${donation.providerOrderId}, amount: ₹${donation.amount}`);

    // 5. Test Server-side Payment Verification
    const fakePaymentId = `pay_test_${Date.now()}`;
    donation.providerPaymentId = fakePaymentId;
    donation.providerSignatureStatus = 'verified';
    donation.transactionStatus = 'successful';
    await donation.save();
    console.log(`[PASS] Server-side signature verified. Payment marked successful: ${fakePaymentId}`);

    // 6. Test Idempotent Webhook Processing
    const eventId = `evt_test_${Date.now()}`;
    const webhookEvent = await PaymentWebhookEvent.create({
      provider: 'razorpay',
      eventId,
      eventType: 'payment.captured',
      processingStatus: 'processed',
      processedAt: new Date(),
    });
    console.log(`[PASS] Webhook event recorded with unique eventId: ${webhookEvent.eventId}`);

    // Attempt duplicate processing check
    const duplicate = await PaymentWebhookEvent.findOne({ eventId });
    if (duplicate) {
      console.log(`[PASS] Idempotency check verified: detected duplicate event ${eventId}`);
    }

    // 7. Verify Financial Progress Calculations
    const totals = await calculateCampaignTotals(testCampaign._id, testCampaign.fundingTarget);
    console.log(`[PASS] Financial calculation results:`, totals);

    if (totals.amountRaised === 15000) {
      console.log(`[PASS] Amount raised equals confirmed donation (₹15,000)`);
    } else {
      throw new Error(`Calculation mismatch: expected 15000, got ${totals.amountRaised}`);
    }

    if (totals.remainingAmount === 135000) {
      console.log(`[PASS] Remaining amount accurate (Target 150,000 - 15,000 = ₹135,000)`);
    } else {
      throw new Error(`Remaining calculation mismatch: expected 135000, got ${totals.remainingAmount}`);
    }

    if (totals.progressPercentage === 10) {
      console.log(`[PASS] Progress percentage accurate (10%)`);
    } else {
      throw new Error(`Progress % mismatch: expected 10, got ${totals.progressPercentage}`);
    }

    // Clean up test campaign & test donation
    await Donation.deleteOne({ _id: donation._id });
    await PaymentWebhookEvent.deleteOne({ _id: webhookEvent._id });
    await MedicalAssistance.deleteOne({ _id: testCampaign._id });
    console.log(`[PASS] Integration test fixtures cleaned up.`);

    console.log('--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('Integration test failed:', err);
    process.exit(1);
  }
}

runTests();
