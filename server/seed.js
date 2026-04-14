require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Case = require('./models/Case');
const Campaign = require('./models/Campaign');
const Job = require('./models/Job');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Case.deleteMany(), Campaign.deleteMany(), Job.deleteMany()]);
  console.log('🧹 Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'مدير النظام',
    email: 'admin@jam3iyati.com',
    password: 'Admin@123',
    role: 'admin',
    points: 9999,
    badges: ['سفير الخير', 'فاعل خير'],
  });

  // Create sample user
  await User.create({
    name: 'أحمد محمد',
    email: 'user@jam3iyati.com',
    password: 'User@123',
    role: 'user',
    points: 250,
    badges: ['فاعل خير'],
    totalDonated: 500,
  });

  // Create Cases
  const cases = await Case.create([
    { title: 'علاج طفل مصاب بسرطان الدم', description: 'الطفل كريم (8 سنوات) يحتاج إلى جلسات كيماوي عاجلة. العائلة عاجزة عن تحمل التكاليف الباهظة وتحتاج لمساعدتكم.', category: 'medical', targetAmount: 50000, collectedAmount: 32000, urgent: true, location: 'القاهرة', createdBy: admin._id },
    { title: 'كفالة أسرة من 5 أفراد', description: 'أسرة فقدت عائلها الوحيد وتحتاج إلى دعم شهري لتأمين احتياجاتها الأساسية من طعام ودواء.', category: 'food', targetAmount: 20000, collectedAmount: 8500, urgent: false, location: 'الإسكندرية', createdBy: admin._id },
    { title: 'تعليم 10 أطفال محتاجين', description: 'دعم تعليمي شامل لـ10 أطفال من الأسر الفقيرة يشمل الكتب والمصروف والملابس المدرسية.', category: 'education', targetAmount: 30000, collectedAmount: 15000, urgent: false, location: 'الجيزة', createdBy: admin._id },
    { title: 'بناء منزل لأسرة نازحة', description: 'أسرة نازحة تعيش في ظروف إنسانية قاسية تحتاج إلى بناء مسكن ملائم لها.', category: 'construction', targetAmount: 80000, collectedAmount: 45000, urgent: true, location: 'أسيوط', createdBy: admin._id },
    { title: 'زكاة الفطر لـ100 أسرة', description: 'توزيع زكاة الفطر على 100 أسرة محتاجة قبل حلول عيد الفطر المبارك.', category: 'zakat', targetAmount: 25000, collectedAmount: 25000, status: 'completed', location: 'الدقهلية', createdBy: admin._id },
    { title: 'رعاية 20 يتيم', description: 'كفالة شاملة لـ20 طفل يتيم تشمل التعليم والرعاية الصحية والملبس والمأكل.', category: 'orphans', targetAmount: 60000, collectedAmount: 28000, urgent: false, location: 'المنيا', createdBy: admin._id },
  ]);

  // Create Campaign
  await Campaign.create({
    title: 'حملة رمضان للخير',
    description: 'حملة شاملة في شهر رمضان المبارك لمساعدة أكبر عدد ممكن من المحتاجين',
    goal: 200000,
    raised: 87000,
    organizer: admin._id,
    cases: [cases[0]._id, cases[1]._id, cases[2]._id],
  });

  // Create Jobs
  await Job.create([
    {
      title: 'أخصائي اجتماعي',
      description: 'نبحث عن أخصائي اجتماعي متميز للعمل مع الأسر المحتاجة وتقديم الدعم النفسي والاجتماعي.',
      location: 'القاهرة',
      type: 'fulltime',
      requirements: ['بكالوريوس خدمة اجتماعية', 'خبرة 2 سنة على الأقل', 'مهارات تواصل ممتازة'],
      tasks: ['زيارة الأسر المستفيدة', 'إعداد التقارير الاجتماعية', 'التنسيق مع الجهات المعنية'],
      salary: '3000 - 5000 جنيه',
    },
    {
      title: 'مطور ويب متطوع',
      description: 'فرصة تطوع رائعة للمساهمة في تطوير منصتنا الرقمية وخدمة المجتمع.',
      location: 'عن بُعد',
      type: 'volunteer',
      requirements: ['خبرة في React أو Vue', 'معرفة بـ Node.js', 'شغف بالعمل الخيري'],
      tasks: ['تطوير مميزات جديدة', 'إصلاح الأخطاء', 'تحسين الأداء'],
    },
    {
      title: 'محاسب مالي',
      description: 'محاسب مالي لمتابعة ومراجعة حسابات الجمعية وضمان الشفافية المالية.',
      location: 'الإسكندرية',
      type: 'parttime',
      requirements: ['بكالوريوس محاسبة', 'خبرة في المنظمات غير الربحية', 'إجادة Excel'],
      tasks: ['مراجعة السجلات المالية', 'إعداد التقارير الشهرية', 'متابعة التبرعات'],
      salary: '2000 - 3500 جنيه',
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@jam3iyati.com | 🔑 Password: Admin@123');
  console.log('📧 User:  user@jam3iyati.com  | 🔑 Password: User@123');
  process.exit(0);
};

seed().catch((err) => { console.error('❌ Seed error:', err); process.exit(1); });
