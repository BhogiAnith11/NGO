/**
 * Comprehensive Database Seeder (Merged with NGO-master features)
 * Populates MongoDB with realistic verified NGOs, pending approvals, activities, impact data,
 * connect requests, public donations, charity events/drives, citizen inquiries, and Admin account.
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const NGO = require('./models/NGO');
const Activity = require('./models/Activity');
const ConnectRequest = require('./models/ConnectRequest');
const Donation = require('./models/Donation');
const Contact = require('./models/Contact');
const Event = require('./models/Event');

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas for seeding');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      NGO.deleteMany({}),
      Activity.deleteMany({}),
      ConnectRequest.deleteMany({}),
      Donation.deleteMany({}),
      Contact.deleteMany({}),
      Event.deleteMany({}),
    ]);
    console.log('🧹 Cleaned existing database records');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Test@1234', salt);
    const adminPasswordHash = await bcrypt.hash('Admin@2026', salt);

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'District Nodal Officer',
      email: 'admin@district.gov.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 253 2578901',
    });
    console.log('👑 Admin user created: admin@district.gov.in / Admin@2026');

    // 2. Create Donor & Volunteer Users
    const donor1 = await User.create({
      name: 'Rajesh Sharma (CSR Head)',
      email: 'rajesh.sharma@tata.com',
      passwordHash: defaultPasswordHash,
      role: 'donor',
      phone: '+91 98200 11223',
    });

    const volunteer1 = await User.create({
      name: 'Pooja Kulkarni',
      email: 'pooja.kulkarni@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'volunteer',
      phone: '+91 94222 33445',
    });

    // 3. NGO Users & Profiles
    const ngosToCreate = [
      {
        user: {
          name: 'Dr. Vivek Deshmukh',
          email: 'aarogya.trust@gmail.com',
          role: 'ngo',
          phone: '+91 98220 54321',
        },
        ngo: {
          ngoName: 'Aarogya Gramin Health Foundation',
          registrationNumber: 'MH/2018/0045921',
          focusAreas: ['Health', 'Rural Development'],
          serviceRegion: ['Igatpuri', 'Trimbakeshwar', 'Peth', 'Surgana'],
          address: 'Plot 45, Civil Hospital Road, Nashik - 422002',
          latitude: 19.9975,
          longitude: 73.7898,
          contactEmail: 'contact@aarogyagramin.org',
          contactPhone: '+91 253 2345678',
          website: 'https://aarogyagramin.org',
          description: 'Aarogya Gramin Health Foundation has been dedicated to delivering primary and maternal healthcare services to underserved tribal communities and rural villages across the district since 2018. We operate 4 mobile medical units and conduct weekly doorstep clinics.',
          logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          socialLinks: {
            facebook: 'https://facebook.com/aarogyagramin',
            twitter: 'https://twitter.com/aarogyagramin',
            instagram: 'https://instagram.com/aarogyagramin',
          },
        },
        activities: [
          {
            title: 'Mobile Medical Camp in Surgana Tribal Hamlet',
            description: 'Conducted a 2-day free medical checkup and medicine distribution camp in 4 remote tribal villages. Covered general health screenings, pediatric malnutrition checkups, and free generic medications.',
            date: new Date('2026-06-15'),
            beneficiaryCount: 1450,
            category: 'Health',
            images: [
              'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
            ],
          },
          {
            title: 'Maternal Nutrition & Anemia Awareness Drive',
            description: 'Distributed nutritional kits containing iron-folic supplements, protein powder, and fresh fruits to pregnant and lactating mothers across 12 anganwadis in Igatpuri taluka.',
            date: new Date('2026-07-20'),
            beneficiaryCount: 620,
            category: 'Health',
            images: [
              'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
            ],
          },
        ],
      },
      {
        user: {
          name: 'Sunita Patil',
          email: 'vidyasetu.ngo@gmail.com',
          role: 'ngo',
          phone: '+91 98500 67890',
        },
        ngo: {
          ngoName: 'Vidya Setu Education Initiative',
          registrationNumber: 'MH/2019/0088123',
          focusAreas: ['Education', 'Child Welfare'],
          serviceRegion: ['Nashik Urban', 'Dindori', 'Sinnar'],
          address: '12 Samarth Heights, College Road, Nashik - 422005',
          latitude: 20.0059,
          longitude: 73.7663,
          contactEmail: 'info@vidyasetu.org',
          contactPhone: '+91 253 2598765',
          website: 'https://vidyasetu.org',
          description: 'Vidya Setu bridges the educational gap for first-generation school-goers from migrant laborer and underprivileged families. We set up digital smart classrooms, provide STEM kits, and offer evening remedial learning centers in municipal schools.',
          logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          socialLinks: {
            facebook: 'https://facebook.com/vidyasetu',
            instagram: 'https://instagram.com/vidyasetu',
          },
        },
        activities: [
          {
            title: 'Digital Smart Classroom Setup in 5 ZP Schools',
            description: 'Installed interactive projectors, tablets, and offline educational software in 5 Zilla Parishad primary schools in Dindori block, benefiting grades 1 to 7.',
            date: new Date('2026-05-10'),
            beneficiaryCount: 820,
            category: 'Education',
            images: [
              'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
            ],
          },
          {
            title: 'Annual School Bag & Stationery Kit Distribution',
            description: 'Distributed complete educational starter kits including notebooks, school bags, geometry boxes, and water bottles to 2,000 students starting the academic year.',
            date: new Date('2026-06-28'),
            beneficiaryCount: 2000,
            category: 'Child Welfare',
            images: [
              'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80',
            ],
          },
        ],
      },
      {
        user: {
          name: 'Meera Jadhav',
          email: 'swayam.mahila@gmail.com',
          role: 'ngo',
          phone: '+91 97630 12345',
        },
        ngo: {
          ngoName: 'Swayam Shakti Mahila Mandal',
          registrationNumber: 'MH/2016/0034110',
          focusAreas: ['Women Empowerment', 'Livelihood'],
          serviceRegion: ['Yeola', 'Niphad', 'Sinnar', 'Chandwad'],
          address: 'B-4, Sahakar Bhavan, Old Agra Road, Nashik - 422001',
          latitude: 19.9911,
          longitude: 73.7915,
          contactEmail: 'contact@swayamshakti.org',
          contactPhone: '+91 253 2456789',
          website: 'https://swayamshakti.org',
          description: 'Swayam Shakti empowers rural women and self-help groups (SHGs) through vocational training, financial literacy workshops, and establishing direct market linkages for artisanal Paithani sarees and organic agri-food products.',
          logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          socialLinks: {
            facebook: 'https://facebook.com/swayamshakti',
            instagram: 'https://instagram.com/swayamshakti',
          },
        },
        activities: [
          {
            title: 'Paithani Weaving Skill Certification for 120 Women',
            description: 'Graduation of our 3-month advanced handloom weaving and modern embroidery cohort for women from marginalized farming households in Yeola taluka.',
            date: new Date('2026-04-18'),
            beneficiaryCount: 120,
            category: 'Women Empowerment',
            images: [
              'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
            ],
          },
          {
            title: 'Micro-Finance & Digital UPI Banking Workshop',
            description: 'Trained 45 Self-Help Groups on digital merchant transactions, government Mudra loan documentation, and bookkeeping best practices.',
            date: new Date('2026-07-05'),
            beneficiaryCount: 450,
            category: 'Livelihood',
            images: [
              'https://images.unsplash.com/photo-1556742049-0a67e557b68f?auto=format&fit=crop&w=600&q=80',
            ],
          },
        ],
      },
      {
        user: {
          name: 'Kiran Shinde',
          email: 'harit.dhara@gmail.com',
          role: 'ngo',
          phone: '+91 94231 99887',
        },
        ngo: {
          ngoName: 'Harit Dhara Ecological Foundation',
          registrationNumber: 'MH/2021/0104523',
          focusAreas: ['Environment', 'Rural Development'],
          serviceRegion: ['Trimbak', 'Igatpuri', 'Kalwan', 'Baglan'],
          address: 'Eco Center, Gangapur Road, Nashik - 422013',
          latitude: 20.0125,
          longitude: 73.7432,
          contactEmail: 'trees@haritdhara.org',
          contactPhone: '+91 253 2678123',
          website: 'https://haritdhara.org',
          description: 'Harit Dhara works on watershed management, afforestation of degraded Western Ghats hillocks, organic farming transitions, and community-driven rainwater harvesting structures in drought-prone talukas.',
          logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          socialLinks: {
            twitter: 'https://twitter.com/haritdhara',
            instagram: 'https://instagram.com/haritdhara',
          },
        },
        activities: [
          {
            title: 'Monsoon Afforestation Drive — 25,000 Native Saplings',
            description: 'Planted 25,000 indigenous trees (Neem, Banyan, Mahua, Teak) along degraded slopes in Trimbak range with participation from 400 community volunteers.',
            date: new Date('2026-07-12'),
            beneficiaryCount: 3500,
            category: 'Environment',
            images: [
              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
            ],
          },
        ],
      },
      {
        user: {
          name: 'Anand Kulkarni',
          email: 'prani.raksha@gmail.com',
          role: 'ngo',
          phone: '+91 98900 33441',
        },
        ngo: {
          ngoName: 'Karuna Animal Rescue and Welfare Trust',
          registrationNumber: 'MH/2020/0076129',
          focusAreas: ['Animal Welfare'],
          serviceRegion: ['Nashik City', 'Deolali', 'Sinnar'],
          address: 'Karuna Sanctuary, Gangapur Dam Backwaters, Nashik - 422222',
          latitude: 19.9882,
          longitude: 73.7121,
          contactEmail: 'rescue@karunawelfare.org',
          contactPhone: '+91 253 2981122',
          website: 'https://karunawelfare.org',
          description: 'Karuna operates the district’s largest non-profit animal hospital, shelter sanctuary, and 24/7 wildlife rescue helpline. We treat injured stray animals, conduct animal birth control drives, and rehome rescued cattle.',
          logoUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          socialLinks: {
            instagram: 'https://instagram.com/karunawelfare',
          },
        },
        activities: [
          {
            title: 'Mass Anti-Rabies Vaccination Drive for 1,200 Stray Dogs',
            description: 'Covered 14 municipal wards in Nashik and Deolali Cantonment with certified veterinary teams to administer anti-rabies vaccines and reflective collars.',
            date: new Date('2026-06-05'),
            beneficiaryCount: 1200,
            category: 'Animal Welfare',
            images: [
              'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
            ],
          },
        ],
      },
      // 2 Pending NGOs for Admin testing
      {
        user: {
          name: 'Bhagwan Shinde',
          email: 'sanjeevani.rural@gmail.com',
          role: 'ngo',
          phone: '+91 93700 88123',
        },
        ngo: {
          ngoName: 'Sanjeevani Rural Water & Livelihood Mission',
          registrationNumber: 'MH/2026/0129988',
          focusAreas: ['Rural Development', 'Disaster Relief'],
          serviceRegion: ['Malegaon', 'Nandgaon', 'Satana'],
          address: 'Kisan Seva Kendra, Station Road, Malegaon - 423203',
          contactEmail: 'sanjeevani.mission@gmail.com',
          contactPhone: '+91 2554 231199',
          description: 'Sanjeevani focuses on deep-bore well rejuvenation, micro-drip irrigation for smallholder farmers, and emergency water tanker logistics during drought summers in northern talukas.',
          logoUrl: '',
          status: 'pending',
        },
        activities: [],
      },
      {
        user: {
          name: 'Anita Verma',
          email: 'samarth.bal@gmail.com',
          role: 'ngo',
          phone: '+91 98212 99001',
        },
        ngo: {
          ngoName: 'Samarth Bal Vikas Sanstha',
          registrationNumber: 'MH/2026/0130045',
          focusAreas: ['Child Welfare', 'Education'],
          serviceRegion: ['Peth', 'Kalwan'],
          address: 'Main Market, Peth, Dist. Nashik - 422208',
          contactEmail: 'samarthbal@rediffmail.com',
          contactPhone: '+91 2553 241020',
          description: 'Dedicated to providing mid-day nutritional fruit supplements and after-school sports coaching for tribal youth in hilly tehsils.',
          logoUrl: '',
          status: 'pending',
        },
        activities: [],
      },
    ];

    let createdNGOs = [];

    for (const item of ngosToCreate) {
      const user = await User.create({
        name: item.user.name,
        email: item.user.email,
        passwordHash: defaultPasswordHash,
        role: item.user.role,
        phone: item.user.phone,
      });

      const ngo = await NGO.create({
        ...item.ngo,
        userId: user._id,
      });

      createdNGOs.push(ngo);

      if (item.activities && item.activities.length > 0) {
        for (const act of item.activities) {
          await Activity.create({
            ...act,
            ngoId: ngo._id,
          });
        }
      }
    }

    console.log(`✅ Seeded ${createdNGOs.length} NGOs (5 approved, 2 pending for admin approval test)`);

    // 4. Create sample Connect Requests
    const approvedNGO1 = createdNGOs[0]; // Aarogya
    const approvedNGO2 = createdNGOs[1]; // Vidya Setu

    await ConnectRequest.create({
      fromUserId: donor1._id,
      toNgoId: approvedNGO1._id,
      senderName: donor1.name,
      senderEmail: donor1.email,
      senderRole: donor1.role,
      message: 'Greetings! Our CSR foundation is reviewing primary healthcare initiatives for tribal hamlets in Nashik district. We would like to schedule a virtual meeting to discuss funding support for your mobile medical units.',
      status: 'sent',
    });

    await ConnectRequest.create({
      fromUserId: volunteer1._id,
      toNgoId: approvedNGO2._id,
      senderName: volunteer1.name,
      senderEmail: volunteer1.email,
      senderRole: volunteer1.role,
      message: 'Hello Vidya Setu team! I am a software engineer living in Nashik and would love to volunteer on weekends to teach basic computer programming and digital literacy to students in your remedial centers.',
      status: 'sent',
    });

    // 5. Seed sample Donations (from NGO-master)
    await Donation.create([
      {
        name: 'Rajesh Sharma (Tata Motors CSR)',
        phone: '9820011223',
        email: 'rajesh.sharma@tata.com',
        location: 'Nashik Urban',
        donationType: 'money',
        amount: 250000,
        targetNgoId: approvedNGO1._id,
        targetNgoName: approvedNGO1.ngoName,
        status: 'received',
      },
      {
        name: 'Sneha Joshi',
        phone: '9822334455',
        email: 'sneha.j@gmail.com',
        location: 'College Road, Nashik',
        donationType: 'education',
        itemDescription: '100 School bags, geometry boxes, and 500 spiral notebooks for grade 5-10 students',
        targetNgoId: approvedNGO2._id,
        targetNgoName: approvedNGO2.ngoName,
        status: 'delivered',
      },
      {
        name: 'Deepak Patel (Rotary Club)',
        phone: '9422119988',
        email: 'deepak.patel@rotary.org',
        location: 'Igatpuri',
        donationType: 'food',
        itemDescription: '50 Dry Ration Grocery Kits (Atta, Rice, Pulses, Cooking Oil) for tribal families',
        targetNgoName: 'District General Welfare Fund',
        status: 'delivered',
      },
      {
        name: 'Amitabh Sen',
        phone: '9850112233',
        email: 'amitabh.sen@rediffmail.com',
        location: 'Sinnar',
        donationType: 'medical',
        itemDescription: '20 First Aid and generic pediatric medication packs',
        targetNgoId: approvedNGO1._id,
        targetNgoName: approvedNGO1.ngoName,
        status: 'received',
      },
    ]);
    console.log('✅ Seeded 4 sample donations');

    // 6. Seed sample Charity Events & Drives (from NGO-master)
    await Event.create([
      {
        title: 'District Mega Food & Ration Relief Drive',
        description: 'Joint weekend food distribution campaign covering 600 migrant laborer households and orphanages across Nashik talukas.',
        category: 'Food Drive',
        date: new Date('2026-09-12'),
        location: 'Shree Samarth Hall, CBS, Nashik',
        organizer: 'District Social Welfare & Vidya Setu',
        organizerNgoId: approvedNGO2._id,
        image: '/asset/food.png',
        volunteersNeeded: 35,
        volunteersRegistered: 18,
        contactPhone: '+91 253 2598765',
      },
      {
        title: 'Tribal Hamlet Health & Pediatric Screening Camp',
        description: 'Comprehensive 2-day free medical camp providing general health diagnostics, eye screenings, and pediatric malnutrition checkups.',
        category: 'Health & Medical Camp',
        date: new Date('2026-09-20'),
        location: 'Rural Hospital Ground, Surgana, Nashik',
        organizer: 'Aarogya Gramin Health Foundation',
        organizerNgoId: approvedNGO1._id,
        image: '/asset/medical.png',
        volunteersNeeded: 25,
        volunteersRegistered: 14,
        contactPhone: '+91 253 2345678',
      },
      {
        title: 'Digital Literacy & STEM Workshop for Rural Schools',
        description: 'Interactive weekend coding and science experimentation session with tablets and robotics kits for grade 6-8 students.',
        category: 'Education & Literacy',
        date: new Date('2026-09-27'),
        location: 'ZP High School, Dindori Tehsil',
        organizer: 'Vidya Setu Education Initiative',
        organizerNgoId: approvedNGO2._id,
        image: '/asset/education.png',
        volunteersNeeded: 20,
        volunteersRegistered: 9,
        contactPhone: '+91 253 2598765',
      },
      {
        title: 'Western Ghats Monsoon Hillock Afforestation',
        description: 'Community tree planting drive to plant 5,000 indigenous broadleaf saplings along deforested slopes in Trimbak range.',
        category: 'Afforestation & Environment',
        date: new Date('2026-10-04'),
        location: 'Anjaneri Foothills, Trimbakeshwar',
        organizer: 'Harit Dhara Ecological Foundation',
        image: '/asset/img1.png',
        volunteersNeeded: 50,
        volunteersRegistered: 32,
        contactPhone: '+91 253 2678123',
      },
    ]);
    console.log('✅ Seeded 4 charity events & drives');

    // 7. Seed sample Contact Inquiries (from NGO-master)
    await Contact.create([
      {
        name: 'Sunil Gokhale (Mahindra & Mahindra CSR)',
        email: 'sunil.gokhale@mahindra.com',
        phone: '+91 98220 99887',
        subject: 'CSR Grant Collaboration for Rural Women SHGs',
        message: 'Our corporate social responsibility division is looking to sponsor 100 rural women weavers in Yeola tehsil with modern handloom tools. Please share the official nodal process for tripartite MoU.',
        status: 'new',
      },
      {
        name: 'Geeta Nair',
        email: 'geeta.nair@gmail.com',
        phone: '+91 97650 11223',
        subject: 'Volunteer Weekend Registration Query',
        message: 'I would like to organize weekly science storytelling sessions at local municipal schools. Which verified education non-profits can accommodate weekend schedules?',
        status: 'in_review',
      },
    ]);
    console.log('✅ Seeded sample citizen inquiries');

    console.log('\n🎉 ================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY WITH ALL MERGED FEATURES!');
    console.log('==================================================');
    console.log('Admin Login   : admin@district.gov.in / Admin@2026');
    console.log('NGO Login (1) : aarogya.trust@gmail.com / Test@1234');
    console.log('NGO Login (2) : vidyasetu.ngo@gmail.com / Test@1234');
    console.log('Donor Login   : rajesh.sharma@tata.com / Test@1234');
    console.log('Volunteer     : pooja.kulkarni@gmail.com / Test@1234');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
