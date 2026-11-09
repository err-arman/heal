import type {
  fundingSources,
  locations,
  researchDomains,
  studyTypes,
} from '../../database/schema/index.js';

export const researchDomainSeedData: (typeof researchDomains.$inferInsert)[] = [
  {
    nameEn: 'Maternal and Child Health',
    nameBn: 'মাতৃ ও শিশু স্বাস্থ্য',
    descriptionEn: 'Research on maternal, newborn, and child health outcomes.',
    descriptionBn: 'মা, নবজাতক ও শিশু স্বাস্থ্য ফলাফল বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Nutrition',
    nameBn: 'পুষ্টি',
    descriptionEn: 'Research on nutrition, diet, and food security.',
    descriptionBn: 'পুষ্টি, খাদ্যাভ্যাস ও খাদ্য নিরাপত্তা বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Communicable Diseases',
    nameBn: 'সংক্রামক রোগ',
    descriptionEn: 'Research on infectious and communicable diseases.',
    descriptionBn: 'সংক্রামক ও ছোঁয়াচে রোগ বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Non-Communicable Diseases',
    nameBn: 'অসংক্রামক রোগ',
    descriptionEn: 'Research on chronic and non-communicable diseases.',
    descriptionBn: 'দীর্ঘমেয়াদি ও অসংক্রামক রোগ বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Mental Health',
    nameBn: 'মানসিক স্বাস্থ্য',
    descriptionEn: 'Research on mental health and psychosocial wellbeing.',
    descriptionBn: 'মানসিক স্বাস্থ্য ও মানসিক-সামাজিক সুস্থতা বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Environmental and Occupational Health',
    nameBn: 'পরিবেশ ও পেশাগত স্বাস্থ্য',
    descriptionEn: 'Research on environmental exposures and workplace health.',
    descriptionBn: 'পরিবেশগত ঝুঁকি ও কর্মক্ষেত্রের স্বাস্থ্য বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Health Systems and Policy',
    nameBn: 'স্বাস্থ্য ব্যবস্থা ও নীতি',
    descriptionEn: 'Research on health systems, governance, and policy.',
    descriptionBn: 'স্বাস্থ্য ব্যবস্থা, সুশাসন ও নীতি বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Sexual and Reproductive Health',
    nameBn: 'যৌন ও প্রজনন স্বাস্থ্য',
    descriptionEn: 'Research on sexual and reproductive health and rights.',
    descriptionBn: 'যৌন ও প্রজনন স্বাস্থ্য এবং অধিকার বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Water, Sanitation and Hygiene',
    nameBn: 'পানি, স্যানিটেশন ও স্বাস্থ্যবিধি',
    descriptionEn: 'Research on water, sanitation, and hygiene (WASH).',
    descriptionBn: 'পানি, স্যানিটেশন ও স্বাস্থ্যবিধি (ওয়াশ) বিষয়ক গবেষণা।',
  },
  {
    nameEn: 'Health Informatics',
    nameBn: 'স্বাস্থ্য তথ্যবিজ্ঞান',
    descriptionEn: 'Research on health data, information systems, and digital health.',
    descriptionBn: 'স্বাস্থ্য তথ্য, তথ্যব্যবস্থা ও ডিজিটাল স্বাস্থ্য বিষয়ক গবেষণা।',
  },
];

export const studyTypeSeedData: (typeof studyTypes.$inferInsert)[] = [
  { nameEn: 'Cross-sectional Study', nameBn: 'ক্রস-সেকশনাল গবেষণা' },
  { nameEn: 'Cohort Study', nameBn: 'কোহোর্ট গবেষণা' },
  { nameEn: 'Case-Control Study', nameBn: 'কেস-কন্ট্রোল গবেষণা' },
  {
    nameEn: 'Randomized Controlled Trial',
    nameBn: 'র‍্যান্ডমাইজড কন্ট্রোলড ট্রায়াল',
  },
  { nameEn: 'Systematic Review', nameBn: 'পদ্ধতিগত পর্যালোচনা' },
  { nameEn: 'Qualitative Study', nameBn: 'গুণগত গবেষণা' },
  { nameEn: 'Mixed-Methods Study', nameBn: 'মিশ্র-পদ্ধতি গবেষণা' },
  { nameEn: 'Program Evaluation', nameBn: 'কর্মসূচি মূল্যায়ন' },
  { nameEn: 'Operational Research', nameBn: 'অপারেশনাল গবেষণা' },
  { nameEn: 'Case Report', nameBn: 'কেস রিপোর্ট' },
];

export const fundingSourceSeedData: (typeof fundingSources.$inferInsert)[] = [
  { nameEn: 'Government', nameBn: 'সরকার' },
  { nameEn: 'International Donor', nameBn: 'আন্তর্জাতিক দাতা' },
  {
    nameEn: 'Non-Governmental Organization (NGO)',
    nameBn: 'বেসরকারি সংস্থা (এনজিও)',
  },
  { nameEn: 'Academic Institution', nameBn: 'শিক্ষা প্রতিষ্ঠান' },
  { nameEn: 'Private Sector', nameBn: 'বেসরকারি খাত' },
  { nameEn: 'Self-Funded', nameBn: 'স্ব-অর্থায়ন' },
  { nameEn: 'Mixed Funding', nameBn: 'মিশ্র অর্থায়ন' },
  { nameEn: 'Not Applicable', nameBn: 'প্রযোজ্য নয়' },
];

export const locationSeedData: (typeof locations.$inferInsert)[] = [
  { nameEn: 'National', nameBn: 'জাতীয়' },
  { nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { nameEn: 'Khulna', nameBn: 'খুলনা' },
  { nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];
