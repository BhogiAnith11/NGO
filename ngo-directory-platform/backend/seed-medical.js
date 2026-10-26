const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const MedicalAssistance = require('./models/MedicalAssistance');
const MedicalUpdate = require('./models/MedicalUpdate');
const Donation = require('./models/Donation');

dotenv.config();

const seedMedicalData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Medical Seeding...');

    // Find or create admin and patient users
    let admin = await User.findOne({ role: 'admin' });
    let patientUser = await User.findOne({ email: 'rahul.sharma@example.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'Rahul Sharma (Father of Aarav)',
        email: 'rahul.sharma@example.com',
        passwordHash: '$2a$10$wN9aJv4mF55p7m.V2k/LveOq/n4L.mC0X0Fv5kZpUfL0Q1e1xK2p.', // dummy hash
        role: 'patient',
        phone: '9876543210',
      });
    }

    let patientUser2 = await User.findOne({ email: 'sunita.patil@example.com' });
    if (!patientUser2) {
      patientUser2 = await User.create({
        name: 'Sunita Patil',
        email: 'sunita.patil@example.com',
        passwordHash: '$2a$10$wN9aJv4mF55p7m.V2k/LveOq/n4L.mC0X0Fv5kZpUfL0Q1e1xK2p.',
        role: 'patient',
        phone: '9822334455',
      });
    }

    let patientUser3 = await User.findOne({ email: 'vikram.deshmukh@example.com' });
    if (!patientUser3) {
      patientUser3 = await User.create({
        name: 'Vikram Deshmukh (Brother)',
        email: 'vikram.deshmukh@example.com',
        passwordHash: '$2a$10$wN9aJv4mF55p7m.V2k/LveOq/n4L.mC0X0Fv5kZpUfL0Q1e1xK2p.',
        role: 'patient',
        phone: '9766554433',
      });
    }

    // Check if campaigns already exist
    const count = await MedicalAssistance.countDocuments();
    if (count > 0) {
      console.log(`Medical assistance campaigns already seeded (${count} records). Skipping.`);
      process.exit(0);
    }

    console.log('Seeding initial medical assistance campaigns...');

    const campaign1 = await MedicalAssistance.create({
      createdBy: patientUser._id,
      representative: {
        name: 'Rahul Sharma',
        relationship: 'Father',
        phone: '9876543210',
        email: 'rahul.sharma@example.com',
        emergencyContact: '9876543211',
      },
      patientDisplayName: 'Baby Aarav (4 Years)',
      privatePatientDetails: {
        fullName: 'Aarav Rahul Sharma',
        age: 4,
        contactPhone: '9876543210',
        contactEmail: 'rahul.sharma@example.com',
        address: 'Plot 42, Anand Nagar, Deolali',
        district: 'Nashik',
        village: 'Deolali',
        emergencyContact: '9876543211',
        amountAlreadyReceived: 50000,
      },
      conditionCategory: 'Pediatric Care',
      medicalSummary:
        'Aarav was diagnosed with severe Ventricular Septal Defect (Congenital Heart Disease) requiring urgent open-heart surgical closure.',
      treatmentDetails:
        'Corrective cardiac surgery, post-operative pediatric intensive care unit (PICU) recovery, and pulmonary stabilization.',
      hospitalDetails: {
        hospitalName: 'Apollo Speciality Childrens Hospital',
        hospitalLocation: 'Nashik Central, Maharashtra',
        doctorName: 'Dr. S. K. Kulkarni (Chief Pediatric Cardiac Surgeon)',
        estimatedCost: 350000,
        admissionDate: new Date(Date.now() + 10 * 86400000),
        showHospitalPublicly: true,
      },
      district: 'Nashik',
      serviceLocation: 'Deolali / Nashik Rural',
      fundingTarget: 300000,
      fundingCurrency: 'INR',
      urgency: 'critical',
      treatmentDeadline: new Date(Date.now() + 20 * 86400000),
      verificationStatus: 'Approved',
      campaignStatus: 'Active',
      reviewedBy: admin ? admin._id : patientUser._id,
      reviewedAt: new Date(),
      publicConsent: true,
    });

    const campaign2 = await MedicalAssistance.create({
      createdBy: patientUser2._id,
      representative: {
        name: 'Sunita Patil',
        relationship: 'Self',
        phone: '9822334455',
        email: 'sunita.patil@example.com',
      },
      patientDisplayName: 'Sunita P. (38 Years)',
      privatePatientDetails: {
        fullName: 'Sunita Ramesh Patil',
        age: 38,
        contactPhone: '9822334455',
        contactEmail: 'sunita.patil@example.com',
        address: 'House 14, Gangapur Road',
        district: 'Nashik',
        village: 'Gangapur',
        amountAlreadyReceived: 100000,
      },
      conditionCategory: 'Cancer Treatment',
      medicalSummary:
        'Stage 3 Infiltrating Ductal Breast Carcinoma requiring 6 cycles of adjuvant targeted chemotherapy and radiotherapy.',
      treatmentDetails: 'Cycles of Trastuzumab and Paclitaxel followed by 25 sessions of intensity modulated radiation therapy.',
      hospitalDetails: {
        hospitalName: 'Curie Manavata Cancer Centre',
        hospitalLocation: 'Nashik',
        doctorName: 'Dr. Raj Nagarkar',
        estimatedCost: 450000,
        admissionDate: new Date(),
        showHospitalPublicly: true,
      },
      district: 'Nashik',
      serviceLocation: 'Gangapur Road, Nashik',
      fundingTarget: 350000,
      fundingCurrency: 'INR',
      urgency: 'urgent',
      treatmentDeadline: new Date(Date.now() + 35 * 86400000),
      verificationStatus: 'Approved',
      campaignStatus: 'Active',
      reviewedBy: admin ? admin._id : patientUser2._id,
      reviewedAt: new Date(),
      publicConsent: true,
    });

    const campaign3 = await MedicalAssistance.create({
      createdBy: patientUser3._id,
      representative: {
        name: 'Vikram Deshmukh',
        relationship: 'Brother',
        phone: '9766554433',
        email: 'vikram.deshmukh@example.com',
      },
      patientDisplayName: 'Kishore D. (29 Years, Farmer)',
      privatePatientDetails: {
        fullName: 'Kishore Pandurang Deshmukh',
        age: 29,
        contactPhone: '9766554433',
        address: 'Wadivarhe Village, Igatpuri Taluka',
        district: 'Nashik',
        village: 'Wadivarhe',
        amountAlreadyReceived: 20000,
      },
      conditionCategory: 'Accident & Trauma',
      medicalSummary:
        'Severe road traffic polytrauma leading to compound comminuted bilateral femoral fractures and acute traumatic subarachnoid hemorrhage.',
      treatmentDetails: 'Emergency bilateral intramedullary nailing and neuro-intensive monitoring with ventilator support.',
      hospitalDetails: {
        hospitalName: 'District Civil Hospital Trauma Center & Sahyadri Super Speciality',
        hospitalLocation: 'Nashik',
        doctorName: 'Dr. Vivek Shinde',
        estimatedCost: 280000,
        showHospitalPublicly: true,
      },
      district: 'Nashik',
      serviceLocation: 'Igatpuri Taluka',
      fundingTarget: 220000,
      fundingCurrency: 'INR',
      urgency: 'life_threatening',
      treatmentDeadline: new Date(Date.now() + 7 * 86400000),
      verificationStatus: 'Approved',
      campaignStatus: 'Active',
      reviewedBy: admin ? admin._id : patientUser3._id,
      reviewedAt: new Date(),
      publicConsent: true,
    });

    // Add a Pending campaign for admin verification testing
    await MedicalAssistance.create({
      createdBy: patientUser._id,
      representative: {
        name: 'Rahul Sharma',
        relationship: 'Uncle',
        phone: '9876543210',
      },
      patientDisplayName: 'Pooja K. (19 Years, Student)',
      privatePatientDetails: {
        fullName: 'Pooja Suresh Kulkarni',
        age: 19,
        contactPhone: '9876543210',
        district: 'Nashik',
        village: 'Sinnar',
      },
      conditionCategory: 'Surgery',
      medicalSummary: 'Avascular necrosis of femoral head requiring urgent total hip replacement.',
      treatmentDetails: 'Uncemented ceramic total hip arthroplasty with physiotherapy rehabilitation.',
      hospitalDetails: {
        hospitalName: 'Wockhardt Hospital',
        hospitalLocation: 'Nashik',
        estimatedCost: 180000,
        showHospitalPublicly: true,
      },
      district: 'Nashik',
      serviceLocation: 'Sinnar Taluka',
      fundingTarget: 180000,
      fundingCurrency: 'INR',
      urgency: 'urgent',
      treatmentDeadline: new Date(Date.now() + 45 * 86400000),
      verificationStatus: 'Pending',
      campaignStatus: 'Active',
      publicConsent: true,
    });

    // Seed some treatment updates
    await MedicalUpdate.create({
      campaign: campaign1._id,
      author: patientUser._id,
      title: 'Pre-surgery ECHO and Pulmonary Tests Completed',
      description:
        'Aarav underwent his pre-operative diagnostic tests yesterday at Apollo Hospital. The doctors confirmed his vitals are stable for scheduled surgery next week. Thank you all donors for your immense prayers and assistance.',
      visibility: 'public',
      publishedAt: new Date(Date.now() - 2 * 86400000),
    });

    await MedicalUpdate.create({
      campaign: campaign2._id,
      author: patientUser2._id,
      title: 'Completed 2nd Chemotherapy Cycle Successfully',
      description:
        'Sunita was discharged after receiving her second targeted therapy cycle. Her blood counts are responding positively. We are grateful for every donation received so far.',
      visibility: 'public',
      publishedAt: new Date(Date.now() - 4 * 86400000),
    });

    // Seed a few verified direct donations
    await Donation.create([
      {
        targetType: 'medical_campaign',
        targetCampaign: campaign1._id,
        amount: 25000,
        currency: 'INR',
        paymentProvider: 'razorpay',
        providerOrderId: 'order_seed_001',
        providerPaymentId: 'pay_seed_001',
        providerSignatureStatus: 'verified',
        transactionStatus: 'successful',
        isAnonymous: false,
        name: 'Dr. Anand Joshi',
        donorMessage: 'Praying for baby Aarav full and swift recovery.',
        receiptReference: 'RCPT-20260301-AJ01',
        status: 'delivered',
      },
      {
        targetType: 'medical_campaign',
        targetCampaign: campaign1._id,
        amount: 10000,
        currency: 'INR',
        paymentProvider: 'razorpay',
        providerOrderId: 'order_seed_002',
        providerPaymentId: 'pay_seed_002',
        providerSignatureStatus: 'verified',
        transactionStatus: 'successful',
        isAnonymous: true,
        name: 'Anonymous Donor',
        donorMessage: 'Stay strong little warrior!',
        receiptReference: 'RCPT-20260302-AN02',
        status: 'delivered',
      },
      {
        targetType: 'medical_campaign',
        targetCampaign: campaign2._id,
        amount: 50000,
        currency: 'INR',
        paymentProvider: 'razorpay',
        providerOrderId: 'order_seed_003',
        providerPaymentId: 'pay_seed_003',
        providerSignatureStatus: 'verified',
        transactionStatus: 'successful',
        isAnonymous: false,
        name: 'Rotary Club Welfare Wing',
        donorMessage: 'Contributing towards Sunitas oncology treatment fund.',
        receiptReference: 'RCPT-20260303-RC03',
        status: 'delivered',
      },
      {
        targetType: 'medical_campaign',
        targetCampaign: campaign3._id,
        amount: 15000,
        currency: 'INR',
        paymentProvider: 'razorpay',
        providerOrderId: 'order_seed_004',
        providerPaymentId: 'pay_seed_004',
        providerSignatureStatus: 'verified',
        transactionStatus: 'successful',
        isAnonymous: false,
        name: 'Kisan Mitra Relief Circle',
        donorMessage: 'Emergency trauma relief contribution for fellow farmer brother Kishore.',
        receiptReference: 'RCPT-20260304-KM04',
        status: 'delivered',
      },
    ]);

    console.log('✅ Medical assistance sample data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedMedicalData();
