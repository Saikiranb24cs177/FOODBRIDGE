const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const DonationRequest = require('../models/DonationRequest');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Seeding sample data for FoodBridge directly into MongoDB...');

    // Clear existing collections
    await User.deleteMany({});
    await FoodDonation.deleteMany({});
    await DonationRequest.deleteMany({});
    await TrackingLog.deleteMany({});
    await Notification.deleteMany({});

    const passwordHash = await bcrypt.hash('Password123!', 10);
    const now = new Date();

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@foodbridge.org',
      password: passwordHash,
      role: 'admin',
      organizationName: 'FoodBridge Global Initiative',
      organizationType: 'Charitable Trust',
      phone: '+91 98765 43210',
      address: 'Suite 400, FoodBridge Tower, Tech Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      isVerified: true,
      verificationStatus: 'verified',
      status: 'active',
    });

    const donor1 = await User.create({
      name: 'Chef Vikram Anand',
      email: 'donor@foodbridge.org',
      password: passwordHash,
      role: 'donor',
      organizationName: 'Grand Royal Hotel & Banquets',
      organizationType: 'Hotel',
      phone: '+91 98123 45678',
      address: '42 MG Road, Ashok Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      location: { type: 'Point', coordinates: [77.6097, 12.9754] },
      isVerified: true,
      verificationStatus: 'verified',
      status: 'active',
    });

    const donor2 = await User.create({
      name: 'Anita Sharma',
      email: 'anita@greenleaf.com',
      password: passwordHash,
      role: 'donor',
      organizationName: 'The Green Leaf Caterers',
      organizationType: 'Catering Service',
      phone: '+91 98234 56789',
      address: '15 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      location: { type: 'Point', coordinates: [77.6412, 12.9719] },
      isVerified: true,
      verificationStatus: 'verified',
      status: 'active',
    });

    const donor3 = await User.create({
      name: 'Suresh Rao',
      email: 'suresh@heritagehall.com',
      password: passwordHash,
      role: 'donor',
      organizationName: 'Heritage Convention Center',
      organizationType: 'Function Hall',
      phone: '+91 98345 67890',
      address: '77 Bannerghatta Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560076',
      location: { type: 'Point', coordinates: [77.5993, 12.8988] },
      isVerified: true,
      verificationStatus: 'verified',
      status: 'active',
    });

    // NGO 1: Verified
    const ngo1 = await User.create({
      name: 'Rajeshwari Patel',
      email: 'ngo@foodbridge.org',
      password: passwordHash,
      role: 'ngo',
      organizationName: 'Hope Child Care & Orphanage',
      organizationType: 'Orphanage',
      phone: '+91 98456 78901',
      address: '12 Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560034',
      location: { type: 'Point', coordinates: [77.6256, 12.9352] },
      isVerified: true,
      verificationStatus: 'verified',
      verificationDetails: {
        registrationNumber: 'BLR/NGO/2019/8821',
        darpanId: 'KA/2019/023194',
        taxExemption80G: '80G-DEL-2020-0019',
        notes: 'Duly verified child welfare shelter with 80 children.',
      },
      beneficiaryCapacity: 80,
      preferredCategories: ['Cooked meals', 'Rice and grains', 'Fruits'],
      status: 'active',
    });

    // NGO 2: Verified
    const ngo2 = await User.create({
      name: 'Sunil Kulkarni',
      email: 'sunil@annapurnaseva.org',
      password: passwordHash,
      role: 'ngo',
      organizationName: 'Annapurna Seva Trust',
      organizationType: 'NGO',
      phone: '+91 98567 89012',
      address: '88 Jayanagar 7th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560082',
      location: { type: 'Point', coordinates: [77.5802, 12.9249] },
      isVerified: true,
      verificationStatus: 'verified',
      verificationDetails: {
        registrationNumber: 'KA/TRUST/2021/4910',
        darpanId: 'KA/2021/041120',
        notes: 'Community free kitchen network serving daily wage laborers.',
      },
      beneficiaryCapacity: 120,
      preferredCategories: ['Cooked meals', 'Rice and grains', 'Vegetables', 'Bakery items'],
      status: 'active',
    });

    // NGO 3: Verified Senior Living
    const ngo3 = await User.create({
      name: 'Kavita Nair',
      email: 'kavita@aashraya.org',
      password: passwordHash,
      role: 'ngo',
      organizationName: 'Aashraya Senior Living Care',
      organizationType: 'Old-Age Home',
      phone: '+91 98678 90123',
      address: '23 Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560066',
      location: { type: 'Point', coordinates: [77.7499, 12.9698] },
      isVerified: true,
      verificationStatus: 'verified',
      verificationDetails: {
        registrationNumber: 'BLR/SR/2017/1039',
        darpanId: 'KA/2017/011933',
        notes: 'Licensed elderly shelter housing 65 residents.',
      },
      beneficiaryCapacity: 65,
      preferredCategories: ['Cooked meals', 'Fruits', 'Bakery items', 'Vegetables'],
      status: 'active',
    });

    // NGO 4: Pending Verification (to test Admin verification workflow)
    const ngo4 = await User.create({
      name: 'Devraj Mendonca',
      email: 'devraj@shelterhub.org',
      password: passwordHash,
      role: 'ngo',
      organizationName: 'Shelter Hub Karnataka',
      organizationType: 'Community Shelter',
      phone: '+91 98789 01234',
      address: '5B Malleshwaram 8th Cross',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560003',
      location: { type: 'Point', coordinates: [77.5714, 13.0031] },
      isVerified: false,
      verificationStatus: 'pending',
      verificationDetails: {
        registrationNumber: 'PENDING-REG-2026',
        darpanId: 'DARPAN-APP-9988',
        notes: 'Application submitted on 3rd Nov. Waiting for document review.',
      },
      beneficiaryCapacity: 50,
      preferredCategories: ['Cooked meals', 'Packaged food'],
      status: 'active',
    });

    // 2. Create Food Donations
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    // Donation 1: Available (Biryani + Curry)
    const donation1 = await FoodDonation.create({
      donor: donor1._id,
      foodName: 'Royal Vegetable Dum Biryani & Paneer Gravy',
      description: 'Freshly prepared aromatic basmati rice dum biryani with vegetable paneer subzi from wedding lunch buffet. Stored in hot insulated stainless steel containers.',
      category: 'Cooked meals',
      dietaryType: 'Vegetarian',
      quantity: '35 kg',
      quantityUnit: 'meals',
      servings: 80,
      cookedTime: twoHoursAgo,
      expiryTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
      pickupAddress: 'Grand Royal Hotel, 42 MG Road, Ashok Nagar',
      pickupCity: 'Bengaluru',
      pinCode: '560001',
      pickupStartTime: '14:00',
      pickupEndTime: '19:00',
      pickupWindow: { from: '14:00', to: '19:00' },
      contactPhone: '+91 98123 45678',
      additionalInstructions: 'Please enter via Banquet Gate 2. Inform security for kitchen elevator access.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      safetyCertified: true,
      storageInstruction: 'Keep Hot',
      status: 'Available',
    });

    await TrackingLog.create({
      donation: donation1._id,
      previousStatus: '',
      newStatus: 'Available',
      updatedBy: donor1._id,
      actorRole: 'donor',
      title: 'Food Donation Listed',
      note: 'Donation created by Grand Royal Hotel & Banquets. 80 servings certified safe and ready.',
      timestamp: twoHoursAgo,
    });

    // Donation 2: Available (Artisanal Bakery)
    const donation2 = await FoodDonation.create({
      donor: donor2._id,
      foodName: 'Artisanal Multigrain Breads, Croissants & Buns',
      description: 'Oven-fresh assorted European bakery breads, sandwich buns, and croissants baked this morning for corporate executive conference breakfast.',
      category: 'Bakery items',
      dietaryType: 'Vegetarian',
      quantity: '60 packets',
      quantityUnit: 'packets',
      servings: 120,
      cookedTime: fourHoursAgo,
      expiryTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      pickupAddress: 'The Green Leaf Caterers, 15 Indiranagar 100ft Road',
      pickupCity: 'Bengaluru',
      pinCode: '560038',
      pickupStartTime: '11:00',
      pickupEndTime: '20:00',
      pickupWindow: { from: '11:00', to: '20:00' },
      contactPhone: '+91 98234 56789',
      additionalInstructions: 'Packed in food-grade kraft paper bags ready for transport.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      safetyCertified: true,
      storageInstruction: 'Room Temperature',
      status: 'Available',
    });

    await TrackingLog.create({
      donation: donation2._id,
      previousStatus: '',
      newStatus: 'Available',
      updatedBy: donor2._id,
      actorRole: 'donor',
      title: 'Bakery Surplus Listed',
      note: 'Listed by The Green Leaf Caterers. 120 servings of bread and buns.',
      timestamp: fourHoursAgo,
    });

    // Donation 3: Requested with Pending Request
    const donation3 = await FoodDonation.create({
      donor: donor3._id,
      foodName: 'Traditional South Indian Feast (Sambar, Rice, Poriyal)',
      description: 'Hot steamed sona masuri rice, drumstick sambar, mixed vegetable poriyal, and payasam from an afternoon reception. Feeds 50 people.',
      category: 'Cooked meals',
      dietaryType: 'Vegetarian',
      quantity: '25 kg',
      quantityUnit: 'meals',
      servings: 50,
      cookedTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      expiryTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      pickupAddress: 'Heritage Convention Center, 77 Bannerghatta Main Road',
      pickupCity: 'Bengaluru',
      pinCode: '560076',
      pickupStartTime: '15:30',
      pickupEndTime: '18:30',
      pickupWindow: { from: '15:30', to: '18:30' },
      contactPhone: '+91 98345 67890',
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      safetyCertified: true,
      storageInstruction: 'Keep Hot',
      status: 'Requested',
    });

    const reqFor3 = await DonationRequest.create({
      donation: donation3._id,
      donor: donor3._id,
      ngo: ngo1._id,
      requestedQuantity: 50,
      servingsRequested: 50,
      quantityUnit: 'meals',
      beneficiaries: 50,
      pickupTime: 'Today 16:30',
      proposedPickupTime: 'Today 16:30',
      volunteerName: 'Ramesh Gowda',
      volunteerPhone: '+91 98888 11111',
      vehicleNumber: 'KA-05-MH-4567',
      message: 'Will distribute for evening dinner at Hope Child Care & Orphanage.',
      verificationOtp: '4821',
      status: 'Pending',
    });

    await TrackingLog.create({
      donation: donation3._id,
      previousStatus: '',
      newStatus: 'Available',
      updatedBy: donor3._id,
      actorRole: 'donor',
      title: 'Food Donation Listed',
      note: 'Listed 50 servings of South Indian feast.',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    });

    await TrackingLog.create({
      donation: donation3._id,
      previousStatus: 'Available',
      newStatus: 'Requested',
      updatedBy: ngo1._id,
      actorRole: 'ngo',
      title: 'NGO Request Submitted',
      note: 'Hope Child Care & Orphanage submitted a claim for 50 servings.',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
    });

    // Donation 4: Accepted & Ready for Pickup (with OTP)
    const donation4 = await FoodDonation.create({
      donor: donor1._id,
      foodName: 'Pasta Primavera, Garlic Bread & Soup',
      description: 'Penne in rich tomato basil sauce, herb butter garlic loaves, and roasted vegetable soup from executive lunch buffet.',
      category: 'Cooked meals',
      dietaryType: 'Vegetarian',
      quantity: '20 kg',
      quantityUnit: 'meals',
      servings: 45,
      cookedTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      expiryTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      pickupAddress: 'Grand Royal Hotel, 42 MG Road, Ashok Nagar',
      pickupCity: 'Bengaluru',
      pinCode: '560001',
      pickupStartTime: '15:00',
      pickupEndTime: '19:00',
      pickupWindow: { from: '15:00', to: '19:00' },
      contactPhone: '+91 98123 45678',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810b4?auto=format&fit=crop&w=800&q=80',
      safetyCertified: true,
      storageInstruction: 'Keep Hot',
      status: 'Ready for Pickup',
      assignedNgo: ngo2._id,
    });

    const reqFor4 = await DonationRequest.create({
      donation: donation4._id,
      donor: donor1._id,
      ngo: ngo2._id,
      requestedQuantity: 45,
      servingsRequested: 45,
      quantityUnit: 'meals',
      beneficiaries: 45,
      pickupTime: 'Today 16:00',
      proposedPickupTime: 'Today 16:00',
      volunteerName: 'Pooja Hegde',
      volunteerPhone: '+91 99999 22222',
      vehicleNumber: 'KA-01-AB-8899',
      message: 'For Annapurna Seva distribution at Shivaji Nagar community shelter.',
      verificationOtp: '3924',
      status: 'Ready for Pickup',
      responseNote: 'Approved. Packed in thermal containers at Dispatch Area.',
    });

    donation4.acceptedRequest = reqFor4._id;
    await donation4.save();

    await TrackingLog.create({
      donation: donation4._id,
      previousStatus: '',
      newStatus: 'Available',
      updatedBy: donor1._id,
      actorRole: 'donor',
      title: 'Food Donation Listed',
      note: '45 servings listed.',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    });

    await TrackingLog.create({
      donation: donation4._id,
      previousStatus: 'Available',
      newStatus: 'Accepted',
      updatedBy: donor1._id,
      actorRole: 'donor',
      title: 'Request Accepted',
      note: 'Donor accepted request from Annapurna Seva Trust. Verification OTP: 3924.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    await TrackingLog.create({
      donation: donation4._id,
      previousStatus: 'Accepted',
      newStatus: 'Ready for Pickup',
      updatedBy: donor1._id,
      actorRole: 'donor',
      title: 'Food Packaged & Ready',
      note: 'Food is boxed and ready at Banquet Loading Bay 1.',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    });

    // Donation 5: Delivered & Completed (Fruit & Salads)
    const yesterday = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    const donation5 = await FoodDonation.create({
      donor: donor2._id,
      foodName: 'Fresh Apples, Oranges & Green Garden Salads',
      description: 'High quality surplus fresh fruits and pre-washed salads from conference banquet spread.',
      category: 'Fruits',
      dietaryType: 'Vegan',
      quantity: '40 kg',
      quantityUnit: 'kg',
      servings: 90,
      cookedTime: yesterday,
      expiryTime: new Date(now.getTime() + 18 * 60 * 60 * 1000),
      pickupAddress: 'The Green Leaf Caterers, 15 Indiranagar 100ft Road',
      pickupCity: 'Bengaluru',
      pinCode: '560038',
      pickupStartTime: '09:00',
      pickupEndTime: '14:00',
      pickupWindow: { from: '09:00', to: '14:00' },
      contactPhone: '+91 98234 56789',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      safetyCertified: true,
      storageInstruction: 'Room Temperature',
      status: 'Delivered',
      assignedNgo: ngo3._id,
    });

    const reqFor5 = await DonationRequest.create({
      donation: donation5._id,
      donor: donor2._id,
      ngo: ngo3._id,
      requestedQuantity: 90,
      servingsRequested: 90,
      quantityUnit: 'kg',
      beneficiaries: 65,
      pickupTime: 'Yesterday 11:30',
      proposedPickupTime: 'Yesterday 11:30',
      volunteerName: 'Manoj Kumar',
      volunteerPhone: '+91 97777 33333',
      vehicleNumber: 'KA-04-TC-1234',
      message: 'For 65 residents of Aashraya Senior Care home and community members.',
      verificationOtp: '8152',
      status: 'Delivered',
      responseNote: 'Handed over in refrigerated crates.',
    });

    donation5.acceptedRequest = reqFor5._id;
    await donation5.save();

    await TrackingLog.create({
      donation: donation5._id,
      previousStatus: '',
      newStatus: 'Available',
      updatedBy: donor2._id,
      actorRole: 'donor',
      title: 'Fresh Fruits Listed',
      note: '90 servings listed.',
      timestamp: yesterday,
    });

    await TrackingLog.create({
      donation: donation5._id,
      previousStatus: 'Accepted',
      newStatus: 'Picked Up',
      updatedBy: ngo3._id,
      actorRole: 'ngo',
      title: 'Collected by Volunteer Manoj',
      note: 'Collected from venue.',
      timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    });

    await TrackingLog.create({
      donation: donation5._id,
      previousStatus: 'Picked Up',
      newStatus: 'Delivered',
      updatedBy: ngo3._id,
      actorRole: 'ngo',
      title: 'Meals Delivered Successfully',
      note: '90 servings of fruit and salads enjoyed by elderly residents at Aashraya Senior Care.',
      timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
    });

    // 3. Create Notifications
    await Notification.create([
      {
        userId: donor3._id,
        title: 'New Food Donation Request',
        message: 'Hope Child Care & Orphanage submitted a request for 50 servings of "Traditional South Indian Feast".',
        type: 'request_received',
        link: '/donor/dashboard',
        isRead: false,
      },
      {
        userId: donor1._id,
        title: 'Pickup Scheduled Today',
        message: 'Annapurna Seva Trust volunteer Pooja Hegde is scheduled to pick up "Pasta Primavera" at 16:00.',
        type: 'pickup_ready',
        link: '/donor/dashboard',
        isRead: false,
      },
      {
        userId: ngo1._id,
        title: 'Request Under Review',
        message: 'Your request for "Traditional South Indian Feast" has been delivered to Heritage Convention Center.',
        type: 'system',
        link: '/ngo/dashboard',
        isRead: false,
      },
      {
        userId: ngo2._id,
        title: 'Request Accepted - Ready for Pickup!',
        message: 'Grand Royal Hotel accepted your claim for "Pasta Primavera". Verification PIN: 3924.',
        type: 'request_accepted',
        link: '/ngo/dashboard',
        isRead: false,
      },
      {
        userId: donor2._id,
        title: 'Donation Completed & Impact Recorded',
        message: 'Aashraya Senior Living distributed 90 servings of your fresh fruit donation. 36 kg food waste prevented!',
        type: 'donation_completed',
        link: '/donor/dashboard',
        isRead: true,
      },
    ]);

    console.log('[Seed] Database successfully populated with realistic users, donations, requests, and notifications!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    throw err;
  }
};

// If run directly from CLI
if (require.main === module) {
  require('dotenv').config({ path: '../.env' });
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
