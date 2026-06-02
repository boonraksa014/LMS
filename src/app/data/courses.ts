import { Course } from './types';

export const courses: Course[] = [
  {
    id: 'course-liver-001',
    title: 'ความรู้ผลิตภัณฑ์ดูแลตับ',
    description: 'เรียนรู้ส่วนประกอบ สรรพคุณ และวิธีการแนะนำผลิตภัณฑ์ดูแลตับให้กับลูกค้าอย่างถูกต้อง',
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&h=400&fit=crop',
    duration: '3 ชั่วโมง',
    category: 'Product Knowledge',
    status: 'published',
    allowedGroups: [],
    createdAt: '2024-01-10',
    modules: [
      {
        id: 'mod-liver-1',
        title: 'บทที่ 1: ภาพรวมผลิตภัณฑ์ดูแลตับ',
        lessons: [
          {
            id: 'les-liver-1-0',
            title: 'วิดีโอแนะนำ: ความสำคัญของการดูแลตับ',
            duration: '8 นาที',
            type: 'video',
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            content: `**ยินดีต้อนรับสู่คอร์ส ความรู้ผลิตภัณฑ์ดูแลตับ**

ชมวิดีโอแนะนำด้านบนก่อน แล้วอ่านเนื้อหาประกอบด้านล่าง

**สิ่งที่คุณจะได้เรียนรู้ในคอร์สนี้:**
• หน้าที่สำคัญของตับและสัญญาณอันตราย
• ส่วนประกอบและกลไกของ LiverMax Pro
• กลุ่มเป้าหมายและ Script การแนะนำสินค้า
• วิธีตอบคำถามและข้อโต้แย้งจากลูกค้า

**หมายเหตุ:** วิดีโอนี้เป็นตัวอย่างสำหรับการสาธิตระบบ ทีม Training จะอัปโหลดวิดีโอจริงก่อนเริ่มใช้งานจริง`,
            inVideoQuestions: [
              {
                id: 'ivq-liver-1',
                atSecond: 15,
                question: 'ตับเป็นอวัยวะที่มีหน้าที่หลักด้านใดในร่างกาย?',
                type: 'multiple_choice',
                options: ['ควบคุมการหายใจ', 'กรองและขจัดสารพิษออกจากเลือด', 'สูบฉีดโลหิตทั่วร่างกาย', 'ย่อยอาหารในกระเพาะ'],
                correctIndex: 1,
                mustCorrect: true,
              },
              {
                id: 'ivq-liver-2',
                atSecond: 45,
                question: 'ตับมีน้ำหนักประมาณเท่าใด?',
                type: 'multiple_choice',
                options: ['500 กรัม', '1 กิโลกรัม', '1.5 กิโลกรัม', '3 กิโลกรัม'],
                correctIndex: 2,
                mustCorrect: false,
              },
              {
                id: 'ivq-liver-3',
                atSecond: 90,
                question: 'ตับสามารถฟื้นฟูตัวเองได้หากได้รับความเสียหายในระยะแรก',
                type: 'true_false',
                options: ['ถูก', 'ผิด'],
                correctIndex: 0,
                mustCorrect: false,
              },
            ],
          },
          {
            id: 'les-liver-1-1',
            title: 'ทำไมต้องดูแลตับ?',
            duration: '15 นาที',
            type: 'text',
            content: `ตับเป็นอวัยวะที่ใหญ่ที่สุดในร่างกาย มีน้ำหนักประมาณ 1.5 กิโลกรัม และทำหน้าที่สำคัญมากกว่า 500 อย่าง

**หน้าที่หลักของตับ:**
• กรองและขจัดสารพิษออกจากเลือด
• ผลิตน้ำดีเพื่อช่วยย่อยไขมัน
• สังเคราะห์โปรตีนสำคัญสำหรับร่างกาย
• เก็บสะสมพลังงานในรูปไกลโคเจน
• เมแทบอไลซ์ยาและสารเคมีต่างๆ

**ปัจจัยเสี่ยงที่ทำลายตับ:**
• การดื่มแอลกอฮอล์เป็นประจำ
• อาหารไขมันสูง หวานจัด
• ความเครียดสะสม
• ยาบางชนิดที่ใช้ติดต่อกันนาน
• การสัมผัสสารเคมีในสิ่งแวดล้อม

**สัญญาณเตือนตับมีปัญหา:**
• อ่อนเพลีย เหนื่อยง่ายผิดปกติ
• ตัวเหลือง ตาเหลือง
• ปวดท้องด้านขวาบน
• คลื่นไส้ อาเจียน
• ปัสสาวะสีเข้ม

การดูแลตับด้วยผลิตภัณฑ์เสริมอาหารที่เหมาะสม ร่วมกับการใช้ชีวิตที่ดี จะช่วยรักษาสุขภาพตับให้แข็งแรงในระยะยาว`,
          },
          {
            id: 'les-liver-1-2',
            title: 'รู้จักผลิตภัณฑ์ดูแลตับของเรา',
            duration: '20 นาที',
            type: 'text',
            content: `**ผลิตภัณฑ์ดูแลตับ LiverMax Pro**

ผลิตภัณฑ์เสริมอาหารที่ผสานพลังของสมุนไพรธรรมชาติและสารสกัดที่ผ่านการวิจัยทางวิทยาศาสตร์

**ส่วนประกอบสำคัญ:**

🌿 **Milk Thistle (ซิลิมาริน) 300 mg**
- สารสำคัญ: Silymarin
- คุณสมบัติ: ต้านอนุมูลอิสระ ปกป้องเซลล์ตับ
- งานวิจัย: มีหลักฐานทางคลินิกว่าช่วยฟื้นฟูตับ

🌿 **ขมิ้นชัน (Curcumin) 200 mg**
- สารสำคัญ: Curcuminoids
- คุณสมบัติ: ต้านการอักเสบ ช่วยการไหลเวียนของน้ำดี
- ดูดซึมได้ดีด้วย Bioperine®

🌿 **N-Acetyl Cysteine (NAC) 150 mg**
- คุณสมบัติ: กระตุ้นการสร้าง Glutathione
- ช่วยขจัดสารพิษและโลหะหนักออกจากตับ

**ขนาดและวิธีใช้:**
- รับประทาน 2 แคปซูล วันละ 2 ครั้ง หลังอาหารเช้าและเย็น

**จุดขาย:**
✓ ไม่มีสารพิษตกค้าง ผ่านมาตรฐาน GMP
✓ เหมาะสำหรับผู้ที่ดื่มแอลกอฮอล์ประจำ หรือทำงานสัมผัสสารเคมี
✓ ไม่มีฮอร์โมน ไม่มีสเตียรอยด์`,
          },
        ],
      },
      {
        id: 'mod-liver-2',
        title: 'บทที่ 2: การนำเสนอและตอบคำถาม',
        lessons: [
          {
            id: 'les-liver-2-1',
            title: 'กลุ่มเป้าหมายและการแนะนำสินค้า',
            duration: '20 นาที',
            type: 'text',
            content: `**กลุ่มเป้าหมายหลักสำหรับ LiverMax Pro**

**กลุ่ม 1: ผู้ที่ดื่มแอลกอฮอล์**
- ลักษณะ: ดื่มเป็นประจำ หรือดื่มในสังคม
- Pain Point: กังวลเรื่องสุขภาพตับระยะยาว
- วิธีแนะนำ: เน้นการปกป้องตับเชิงป้องกัน

**กลุ่ม 2: ผู้ที่ต้องกินยาประจำ**
- ลักษณะ: ผู้ป่วยโรคเรื้อรัง กินยาหลายชนิด
- Pain Point: กังวลว่ายาทำลายตับ
- วิธีแนะนำ: เน้น NAC ที่ช่วยปกป้องตับจากยา

**กลุ่ม 3: ผู้ที่ชอบอาหารมัน หวาน**
- ลักษณะ: วัยทำงาน ไลฟ์สไตล์เร่งรีบ
- Pain Point: รู้ตัวว่าอาหารไม่ดี
- วิธีแนะนำ: เน้น Milk Thistle ช่วยฟื้นฟูตับ

**Script เปิดการสนทนา:**
"คุณลูกค้าเคยสังเกตไหมคะ ว่าช่วงนี้เหนื่อยง่ายกว่าปกติ หรือรู้สึกแน่นท้องด้านขวา? นั่นอาจเป็นสัญญาณว่าตับของเราต้องการการดูแลบ้างแล้วค่ะ..."`,
          },
          {
            id: 'les-liver-2-2',
            title: 'ทดสอบความรู้ก่อน Final Exam',
            duration: '10 นาที',
            type: 'text',
            content: `**สรุปสิ่งที่ควรจำสำหรับ LiverMax Pro**

✅ ส่วนประกอบหลัก 3 อย่าง: Milk Thistle + ขมิ้นชัน + NAC
✅ วิธีรับประทาน: 2 แคปซูล x 2 ครั้ง/วัน หลังอาหาร
✅ กลุ่มเป้าหมาย: ดื่มแอล, กินยาประจำ, อาหารมันหวาน
✅ จุดขาย: GMP, ไม่มีฮอร์โมน, วิจัยทางวิทยาศาสตร์
✅ ราคา: 890 บาท/กล่อง (60 แคปซูล = 1 เดือน)

เตรียมพร้อมสำหรับ Final Exam ได้เลยครับ/ค่ะ!`,
            quiz: {
              id: 'quiz-liver-2-2',
              title: 'แบบทดสอบระหว่างเรียน: ผลิตภัณฑ์ดูแลตับ',
              passingScore: 70,
              maxAttempts: 3,
              questions: [
                {
                  id: 'q1',
                  type: 'multiple_choice',
                  question: 'ส่วนประกอบใดใน LiverMax Pro ที่มีสารสำคัญชื่อ Silymarin?',
                  options: ['N-Acetyl Cysteine', 'Milk Thistle', 'ขมิ้นชัน', 'Bioperine®'],
                  correctIndex: 1,
                },
                {
                  id: 'q2',
                  type: 'multiple_choice',
                  question: 'LiverMax Pro ควรรับประทานวันละกี่ครั้ง?',
                  options: ['1 ครั้ง', '2 ครั้ง', '3 ครั้ง', '4 ครั้ง'],
                  correctIndex: 1,
                },
                {
                  id: 'q3',
                  type: 'true_false',
                  question: 'LiverMax Pro มีส่วนผสมของฮอร์โมน',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 1,
                },
                {
                  id: 'q4',
                  type: 'multiple_choice',
                  question: 'N-Acetyl Cysteine (NAC) มีคุณสมบัติหลักคืออะไร?',
                  options: ['ต้านการอักเสบ', 'กระตุ้นการสร้าง Glutathione', 'ผลิตน้ำดี', 'ลดไขมันในเลือด'],
                  correctIndex: 1,
                },
                {
                  id: 'q5',
                  type: 'multiple_choice',
                  question: 'กลุ่มใดไม่ใช่กลุ่มเป้าหมายหลักของ LiverMax Pro?',
                  options: ['ผู้ที่ดื่มแอลกอฮอล์ประจำ', 'ผู้ที่ต้องกินยาหลายชนิด', 'นักกีฬาวัยรุ่น', 'ผู้ที่ชอบอาหารมันหวาน'],
                  correctIndex: 2,
                },
              ],
            },
          },
        ],
      },
    ],
    preTest: {
      id: 'pre-liver-001',
      title: 'แบบทดสอบก่อนเรียน: ความรู้ผลิตภัณฑ์ดูแลตับ',
      passingScore: 60,
      maxAttempts: 1,
      questionCount: 10,
      questions: [
        { id: 'pt-l-01', type: 'multiple_choice', question: 'ตับตั้งอยู่บริเวณใดของร่างกาย?', options: ['ท้องซ้ายล่าง', 'ท้องขวาบน', 'กลางหน้าอก', 'หลังด้านซ้าย'], correctIndex: 1 },
        { id: 'pt-l-02', type: 'multiple_choice', question: 'ตับมีน้ำหนักประมาณเท่าไหร่?', options: ['0.5 กิโลกรัม', '1.5 กิโลกรัม', '3 กิโลกรัม', '5 กิโลกรัม'], correctIndex: 1 },
        { id: 'pt-l-03', type: 'true_false', question: 'ตับเป็นอวัยวะที่ใหญ่ที่สุดในร่างกายมนุษย์', options: ['ถูก', 'ผิด'], correctIndex: 0 },
        { id: 'pt-l-04', type: 'multiple_choice', question: 'ข้อใดไม่ใช่หน้าที่ของตับ?', options: ['กรองสารพิษ', 'ผลิตน้ำดี', 'สูบฉีดเลือด', 'สังเคราะห์โปรตีน'], correctIndex: 2 },
        { id: 'pt-l-05', type: 'multiple_choice', question: 'ปัจจัยใดที่ทำลายตับมากที่สุด?', options: ['ออกกำลังกายมากเกินไป', 'ดื่มน้ำมากเกินไป', 'ดื่มแอลกอฮอล์เป็นประจำ', 'นอนหลับมากเกินไป'], correctIndex: 2 },
        { id: 'pt-l-06', type: 'true_false', question: 'การนอนหลับพักผ่อนเพียงพอช่วยให้ตับฟื้นตัวได้ดีขึ้น', options: ['ถูก', 'ผิด'], correctIndex: 0 },
        { id: 'pt-l-07', type: 'multiple_choice', question: 'อาการตัวเหลือง ตาเหลือง บ่งบอกถึงปัญหาของอวัยวะใด?', options: ['ไต', 'ตับ', 'ปอด', 'หัวใจ'], correctIndex: 1 },
        { id: 'pt-l-08', type: 'multiple_choice', question: 'Milk Thistle เป็นสมุนไพรที่มีสรรพคุณเด่นในด้านใด?', options: ['ลดน้ำหนัก', 'ปกป้องเซลล์ตับ', 'บำรุงกระดูก', 'เพิ่มพลังงาน'], correctIndex: 1 },
        { id: 'pt-l-09', type: 'true_false', question: 'ผลิตภัณฑ์เสริมอาหารสามารถทดแทนยารักษาโรคตับได้', options: ['ถูก', 'ผิด'], correctIndex: 1 },
        { id: 'pt-l-10', type: 'multiple_choice', question: 'อาหารประเภทใดควรหลีกเลี่ยงเพื่อสุขภาพตับที่ดี?', options: ['ผักใบเขียว', 'ปลาทะเล', 'อาหารไขมันสูง/หวานจัด', 'ธัญพืชไม่ขัดสี'], correctIndex: 2 },
        { id: 'pt-l-11', type: 'multiple_choice', question: 'สารสกัดจากขมิ้นชันที่มีประโยชน์ต่อตับคือ?', options: ['Quercetin', 'Curcumin', 'Resveratrol', 'Lycopene'], correctIndex: 1 },
        { id: 'pt-l-12', type: 'true_false', question: 'การใช้ยาบางชนิดติดต่อกันนานอาจส่งผลเสียต่อตับ', options: ['ถูก', 'ผิด'], correctIndex: 0 },
      ],
    },
    finalExam: {
      id: 'final-liver-001',
      title: 'Final Exam: ความรู้ผลิตภัณฑ์ดูแลตับ',
      passingScore: 80,
      maxAttempts: 3,
      questions: [
        {
          id: 'fe-q1',
          type: 'multiple_choice',
          question: 'ตับมีหน้าที่หลักอะไรในร่างกาย?',
          options: ['สูบฉีดเลือด', 'กรองและขจัดสารพิษ', 'ผลิตอินซูลิน', 'ควบคุมอุณหภูมิร่างกาย'],
          correctIndex: 1,
        },
        {
          id: 'fe-q2',
          type: 'multiple_choice',
          question: 'ส่วนประกอบหลักของ LiverMax Pro มีกี่ชนิด?',
          options: ['2 ชนิด', '3 ชนิด', '4 ชนิด', '5 ชนิด'],
          correctIndex: 1,
        },
        {
          id: 'fe-q3',
          type: 'true_false',
          question: 'Milk Thistle มีสารสำคัญชื่อ Silymarin ซึ่งมีคุณสมบัติต้านอนุมูลอิสระ',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'fe-q4',
          type: 'multiple_choice',
          question: 'LiverMax Pro ราคาเท่าไหร่ต่อกล่อง?',
          options: ['690 บาท', '790 บาท', '890 บาท', '990 บาท'],
          correctIndex: 2,
        },
        {
          id: 'fe-q5',
          type: 'multiple_choice',
          question: 'สัญญาณเตือนว่าตับมีปัญหาคืออะไร?',
          options: ['ปวดหัวไมเกรน', 'ตัวเหลือง ตาเหลือง', 'ปวดเข่า', 'ผมร่วง'],
          correctIndex: 1,
        },
        {
          id: 'fe-q6',
          type: 'true_false',
          question: 'ขมิ้นชันใน LiverMax Pro ใช้ Bioperine® เพื่อช่วยในการดูดซึม',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'fe-q7',
          type: 'multiple_choice',
          question: 'Script เปิดการสนทนากับลูกค้าที่เหมาะสมสำหรับ LiverMax Pro คือ?',
          options: [
            'ถามว่าลูกค้าต้องการลดน้ำหนักไหม',
            'ถามว่าลูกค้ารู้สึกเหนื่อยง่ายหรือแน่นท้องด้านขวาไหม',
            'ถามว่าลูกค้ามีปัญหาเรื่องการนอนไหม',
            'ถามว่าลูกค้าเป็นโรคเบาหวานไหม',
          ],
          correctIndex: 1,
        },
        {
          id: 'fe-q8',
          type: 'multiple_choice',
          question: 'ข้อใดเป็นจุดขายหลักของ LiverMax Pro?',
          options: [
            'ราคาถูกที่สุดในตลาด',
            'ผ่านมาตรฐาน GMP ไม่มีฮอร์โมน',
            'มีรสชาติอร่อย',
            'ใช้ได้กับทุกวัย',
          ],
          correctIndex: 1,
        },
        {
          id: 'fe-q9',
          type: 'true_false',
          question: 'LiverMax Pro เหมาะสำหรับผู้ที่ต้องการลดน้ำหนักเป็นหลัก',
          options: ['ถูก', 'ผิด'],
          correctIndex: 1,
        },
        {
          id: 'fe-q10',
          type: 'multiple_choice',
          question: '1 กล่อง LiverMax Pro มีกี่แคปซูล (เพียงพอสำหรับกี่เดือน)?',
          options: ['30 แคปซูล (0.5 เดือน)', '60 แคปซูล (1 เดือน)', '90 แคปซูล (1.5 เดือน)', '120 แคปซูล (2 เดือน)'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'course-joint-001',
    title: 'ความรู้ผลิตภัณฑ์ดูแลข้อและกระดูก',
    description: 'เรียนรู้เกี่ยวกับผลิตภัณฑ์บำรุงข้อและกระดูก เหมาะสำหรับกลุ่มผู้สูงอายุและผู้ที่มีปัญหาเข่า',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    duration: '2.5 ชั่วโมง',
    category: 'Product Knowledge',
    status: 'published',
    allowedGroups: [],
    createdAt: '2024-01-15',
    modules: [
      {
        id: 'mod-joint-1',
        title: 'บทที่ 1: ปัญหาข้อและกระดูก',
        lessons: [
          {
            id: 'les-joint-1-0',
            title: 'วิดีโอแนะนำ: ความรู้เบื้องต้นเรื่องข้อและกระดูก',
            duration: '10 นาที',
            type: 'video',
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            content: `**ยินดีต้อนรับสู่คอร์ส ความรู้ผลิตภัณฑ์ดูแลข้อและกระดูก**

ชมวิดีโอแนะนำเพื่อทำความเข้าใจภาพรวมของโรคข้อเสื่อมและผลิตภัณฑ์ JointCare Plus

**เนื้อหาในคอร์สนี้ครอบคลุม:**
• กายวิภาคของข้อต่อและกระดูกอ่อน
• สาเหตุและปัจจัยเสี่ยงของโรคข้อเสื่อม
• ส่วนประกอบสำคัญของ JointCare Plus
• Script การแนะนำสินค้าให้กลุ่มเป้าหมาย

**หมายเหตุ:** วิดีโอนี้เป็นตัวอย่างสำหรับการสาธิตระบบ ทีม Training จะอัปโหลดวิดีโอจริงก่อนเริ่มใช้งานจริง`,
          },
          {
            id: 'les-joint-1-1',
            title: 'ทำความเข้าใจโรคข้อเสื่อม',
            duration: '18 นาที',
            type: 'text',
            content: `**โรคข้อเสื่อม (Osteoarthritis) คืออะไร?**

โรคข้อเสื่อมเป็นโรคที่พบบ่อยที่สุดในกลุ่มโรคข้อ เกิดจากการสึกกร่อนของกระดูกอ่อนที่หุ้มข้อต่อ

**สถิติที่น่าสนใจในไทย:**
• ประชากรไทยกว่า 6 ล้านคนเป็นโรคข้อเสื่อม
• พบในผู้หญิงมากกว่าผู้ชาย 2 เท่า
• ผู้ที่อายุ 60+ มีโอกาสเป็นถึง 60%
• น้ำหนักเกินเพิ่มความเสี่ยงสูงมาก

**อาการที่พบบ่อย:**
• ปวดเข่า โดยเฉพาะเวลาขึ้น-ลงบันได
• ข้อฝืด โดยเฉพาะตอนเช้า
• เสียงดังกรอบแกรบเวลาขยับข้อ
• ข้อบวม แดง อักเสบ

**กลุ่มเสี่ยง:**
- อายุ 50 ปีขึ้นไป
- น้ำหนักเกินมาตรฐาน
- ทำงานที่ต้องยืน เดิน หรือก้มๆ เงยๆ นาน
- นักกีฬาหรือผู้ที่ออกกำลังกายหนักมานาน`,
          },
          {
            id: 'les-joint-1-2',
            title: 'ผลิตภัณฑ์ JointCare Plus',
            duration: '22 นาที',
            type: 'text',
            content: `**JointCare Plus - ผลิตภัณฑ์เสริมอาหารบำรุงข้อและกระดูก**

**ส่วนประกอบสำคัญ:**

💊 **Glucosamine HCl 1,500 mg**
- กระตุ้นการสร้างกระดูกอ่อน
- ลดการอักเสบของข้อ
- มาตรฐาน: GLUCOSAMINE SULFATE 2KCl

💊 **Chondroitin Sulfate 1,200 mg**
- เพิ่มความยืดหยุ่นของกระดูกอ่อน
- ดูดซับแรงกระแทก
- ทำงานเสริมฤทธิ์กับ Glucosamine

💊 **MSM (Methylsulfonylmethane) 500 mg**
- ต้านการอักเสบ
- ซ่อมแซมเนื้อเยื่อ
- ลดอาการปวด

💊 **Collagen Type II 40 mg**
- วัตถุดิบหลักของกระดูกอ่อน
- ฟื้นฟูข้อที่สึกหรอ

**วิธีใช้:**
- รับประทาน 1 ซอง/วัน ละลายน้ำ ดื่มหลังอาหารเช้า
- ควรรับประทานต่อเนื่องอย่างน้อย 3 เดือน

**ราคา:** 1,290 บาท/กล่อง (30 ซอง)`,
          },
        ],
      },
      {
        id: 'mod-joint-2',
        title: 'บทที่ 2: การขายและ Objection',
        lessons: [
          {
            id: 'les-joint-2-1',
            title: 'การแนะนำสินค้าและ Script',
            duration: '15 นาที',
            type: 'text',
            content: `**วิธีแนะนำ JointCare Plus**

**Opening Script:**
"คุณลูกค้ามีปัญหาเรื่องปวดเข่า หรือรู้สึกข้อฝืดตอนเช้าบ้างไหมคะ? หรือมีผู้ใหญ่ที่บ้านที่กำลังมีปัญหาเรื่องข้อๆ อยู่?"

**Benefit Script:**
"JointCare Plus เป็นผลิตภัณฑ์ที่มีส่วนประกอบครบ 4 อย่างในซองเดียว ทั้ง Glucosamine, Chondroitin, MSM และ Collagen Type II ซึ่งทำงานร่วมกันเพื่อบำรุงและฟื้นฟูข้อโดยเฉพาะ..."

**Closing Script:**
"ลูกค้าหลายท่านที่ใช้ต่อเนื่อง 3 เดือน บอกว่าอาการปวดเข่าลดลงชัดเจน และขึ้นบันไดได้คล่องขึ้นมากเลยค่ะ ลองดูไหมคะ?"`,
            quiz: {
              id: 'quiz-joint-2-1',
              title: 'แบบทดสอบ: ผลิตภัณฑ์ JointCare Plus',
              passingScore: 70,
              maxAttempts: 3,
              questions: [
                {
                  id: 'jq1',
                  type: 'multiple_choice',
                  question: 'JointCare Plus มีส่วนประกอบสำคัญกี่ชนิด?',
                  options: ['2 ชนิด', '3 ชนิด', '4 ชนิด', '5 ชนิด'],
                  correctIndex: 2,
                },
                {
                  id: 'jq2',
                  type: 'multiple_choice',
                  question: 'Glucosamine HCl ใน JointCare Plus มีปริมาณเท่าไหร่?',
                  options: ['500 mg', '1,000 mg', '1,500 mg', '2,000 mg'],
                  correctIndex: 2,
                },
                {
                  id: 'jq3',
                  type: 'true_false',
                  question: 'JointCare Plus ควรรับประทานต่อเนื่องอย่างน้อย 3 เดือนเพื่อผลที่ดี',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 0,
                },
                {
                  id: 'jq4',
                  type: 'multiple_choice',
                  question: 'โรคข้อเสื่อมพบในประชากรไทยประมาณกี่ล้านคน?',
                  options: ['2 ล้านคน', '4 ล้านคน', '6 ล้านคน', '8 ล้านคน'],
                  correctIndex: 2,
                },
              ],
            },
          },
        ],
      },
    ],
    finalExam: {
      id: 'final-joint-001',
      title: 'Final Exam: ความรู้ผลิตภัณฑ์ดูแลข้อและกระดูก',
      passingScore: 80,
      maxAttempts: 3,
      questions: [
        {
          id: 'jfe1',
          type: 'multiple_choice',
          question: 'ส่วนประกอบใดใน JointCare Plus ช่วยดูดซับแรงกระแทก?',
          options: ['Glucosamine', 'Chondroitin Sulfate', 'MSM', 'Collagen Type II'],
          correctIndex: 1,
        },
        {
          id: 'jfe2',
          type: 'true_false',
          question: 'โรคข้อเสื่อมพบในผู้หญิงมากกว่าผู้ชาย 2 เท่า',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'jfe3',
          type: 'multiple_choice',
          question: 'JointCare Plus มีราคาเท่าไหร่ต่อกล่อง?',
          options: ['890 บาท', '990 บาท', '1,190 บาท', '1,290 บาท'],
          correctIndex: 3,
        },
        {
          id: 'jfe4',
          type: 'multiple_choice',
          question: 'MSM ใน JointCare Plus มีคุณสมบัติหลักคืออะไร?',
          options: ['สร้างกระดูกอ่อน', 'ต้านการอักเสบและซ่อมแซมเนื้อเยื่อ', 'เพิ่มแคลเซียม', 'ลดน้ำหนัก'],
          correctIndex: 1,
        },
        {
          id: 'jfe5',
          type: 'multiple_choice',
          question: 'วิธีรับประทาน JointCare Plus ที่ถูกต้องคือ?',
          options: [
            '2 เม็ด วันละ 3 ครั้ง',
            '1 ซอง ละลายน้ำ ดื่มหลังอาหารเช้า',
            '2 ซอง ก่อนนอน',
            '1 เม็ด วันละ 2 ครั้ง',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'course-sales-script-001',
    title: 'เทคนิค Sales Script สำหรับนักขาย',
    description: 'เรียนรู้ Script การขายที่มีประสิทธิภาพสำหรับ Sales, Telesales, PC/BA และ Live Commerce',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=400&fit=crop',
    duration: '4 ชั่วโมง',
    category: 'Sales Script',
    status: 'published',
    allowedGroups: ['Sales', 'Telesales', 'PC/BA', 'Live'],
    createdAt: '2024-02-01',
    modules: [
      {
        id: 'mod-sales-1',
        title: 'บทที่ 1: หลักการขายแบบ Consultative',
        lessons: [
          {
            id: 'les-sales-1-0',
            title: 'วิดีโอ: ปฐมนิเทศ — The Art of Consultative Selling',
            duration: '12 นาที',
            type: 'video',
            videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            content: `**ยินดีต้อนรับสู่คอร์ส Sales Script สำหรับนักขาย**

ชมวิดีโอปฐมนิเทศก่อนเริ่มเรียนเนื้อหาทั้งหมด เพื่อให้เข้าใจแนวคิดหลักของการขายแบบ Consultative

**สิ่งที่คุณจะได้จากคอร์สนี้:**
• แนวคิด Consultative Selling ที่แตกต่างจากการขายแบบ Hard Sell
• Script สำหรับ Telesales, PC/BA และ Live Commerce
• เทคนิคการปิดการขาย 5 รูปแบบ
• วิธีรับมือ Objection ที่พบบ่อย

**เป้าหมายของคอร์สนี้:**
ให้คุณสามารถสร้างยอดขายได้อย่างสม่ำเสมอและสร้างความสัมพันธ์ที่ดีกับลูกค้าในระยะยาว

**หมายเหตุ:** วิดีโอนี้เป็นตัวอย่างสำหรับการสาธิตระบบ ทีม Training จะอัปโหลดวิดีโอจริงก่อนเริ่มใช้งานจริง`,
          },
          {
            id: 'les-sales-1-1',
            title: 'จากการขายเป็นการให้คำปรึกษา',
            duration: '25 นาที',
            type: 'text',
            content: `**Consultative Selling คืออะไร?**

การขายแบบ Consultative คือการทำตัวเป็นที่ปรึกษาให้ลูกค้า ไม่ใช่แค่พยายามขายสินค้า

**ความแตกต่างจากการขายแบบเดิม:**

| การขายแบบเดิม | Consultative Selling |
|---|---|
| พูดถึงสินค้าเป็นหลัก | ฟังปัญหาลูกค้าก่อน |
| พูดเยอะ | ถามเยอะ ฟังเยอะ |
| ปิดการขายเร็ว | สร้างความไว้วางใจก่อน |
| เน้น Features | เน้น Benefits ที่ตรงกับปัญหา |

**กระบวนการ Consultative Selling 5 ขั้นตอน:**

1. **Engage** - สร้างความสัมพันธ์ ทักทายด้วยความจริงใจ
2. **Discover** - ค้นหาปัญหาและความต้องการด้วยคำถาม
3. **Diagnose** - วิเคราะห์ว่าสินค้าไหนตอบโจทย์ที่สุด
4. **Present** - นำเสนอ Solution ที่ตรงจุด
5. **Close** - ปิดการขายด้วยความมั่นใจ

**คำถามที่ดีเพื่อค้นหาความต้องการ:**
- "ช่วงนี้มีอาการผิดปกติตรงไหนบ้างครับ/ค่ะ?"
- "เคยใช้ผลิตภัณฑ์เสริมอาหารมาก่อนไหมครับ/ค่ะ?"
- "ใช้ให้ตัวเองหรือซื้อให้ใครที่บ้านครับ/ค่ะ?"`,
          },
          {
            id: 'les-sales-1-2',
            title: 'Script สำหรับ Telesales',
            duration: '30 นาที',
            type: 'text',
            content: `**Telesales Script Guide**

**การเปิดสายอย่างมืออาชีพ:**

"สวัสดีครับ/ค่ะ ผม/หนู [ชื่อ] โทรมาจาก [ชื่อบริษัท] นะครับ/ค่ะ รบกวนขอสักครู่ได้ไหมครับ/ค่ะ?"

(รอคำตอบ)

"ขอบคุณมากครับ/ค่ะ ทางเราโทรมาเพราะคุณ [ชื่อลูกค้า] เคยสนใจผลิตภัณฑ์ดูแลสุขภาพของเรา วันนี้มีโปรโมชันพิเศษที่น่าจะตรงกับความต้องการของคุณ..."

**การจัดการเมื่อลูกค้าไม่ว่าง:**
"โอ้โห ขอโทษด้วยนะครับ/ค่ะ ขอให้ช่วยบอกเวลาที่สะดวกได้ไหมครับ/ค่ะ จะโทรกลับใหม่ครับ/ค่ะ"

**การ Follow-up อย่างมีประสิทธิภาพ:**
- โทรซ้ำสูงสุด 3 ครั้ง ห่างกัน 2-3 วัน
- ส่ง LINE ก่อนโทรเพื่อให้ลูกค้าคุ้นหน้า
- บันทึกข้อมูลลูกค้าทุกครั้งหลังโทร

**โทนเสียงที่ดี:**
✓ ชัดเจน ไม่เร็วเกินไป
✓ มีพลังงาน กระตือรือร้น
✓ อบอุ่น เป็นกันเอง แต่ยังคง Professional`,
          },
        ],
      },
      {
        id: 'mod-sales-2',
        title: 'บทที่ 2: เทคนิคการปิดการขาย',
        lessons: [
          {
            id: 'les-sales-2-1',
            title: 'Closing Techniques ที่ได้ผล',
            duration: '25 นาที',
            type: 'text',
            content: `**เทคนิคการปิดการขาย 5 แบบ**

**1. Assumptive Close**
"ส่งที่อยู่เดิมเลยนะครับ/ค่ะ หรือจะเปลี่ยนเป็นที่ทำงาน?"
(ถือว่าลูกค้าตัดสินใจซื้อแล้ว เหลือแค่รายละเอียด)

**2. Alternative Close**
"คุณสะดวกรับ 1 กล่อง หรือ 3 กล่องดีครับ/ค่ะ? ซื้อ 3 กล่องคุ้มกว่ามากเลย"
(ให้ตัวเลือกแทนการถามว่าซื้อหรือไม่)

**3. Urgency Close**
"โปรโมชัน 3 แถม 1 มีแค่ถึงสิ้นเดือนนี้เท่านั้นนะครับ/ค่ะ จองไว้ก่อนดีกว่า"

**4. Social Proof Close**
"ช่วงนี้ลูกค้าที่ซื้อ LiverMax Pro ส่วนใหญ่สั่ง 3 เดือนเลย บอกว่าเห็นผลชัดกว่า"

**5. Summary Close**
"ทบทวนอีกครั้ง: คุณได้ LiverMax Pro 2 กล่อง ฟรี 1 กล่อง รวม 3 เดือน ราคาเพียง 1,780 บาท ยืนยันเลยได้เลยนะครับ/ค่ะ"`,
            quiz: {
              id: 'quiz-sales-2-1',
              title: 'แบบทดสอบ: เทคนิคการขาย',
              passingScore: 70,
              maxAttempts: 3,
              questions: [
                {
                  id: 'sq1',
                  type: 'multiple_choice',
                  question: 'Consultative Selling เน้นอะไรเป็นหลัก?',
                  options: ['การพูดถึง Features ของสินค้า', 'การฟังปัญหาและให้คำปรึกษา', 'การลดราคา', 'การปิดการขายเร็ว'],
                  correctIndex: 1,
                },
                {
                  id: 'sq2',
                  type: 'multiple_choice',
                  question: '"ส่งที่อยู่เดิมเลยนะครับ หรือจะเปลี่ยนเป็นที่ทำงาน?" เป็น Closing Technique แบบใด?',
                  options: ['Urgency Close', 'Alternative Close', 'Assumptive Close', 'Social Proof Close'],
                  correctIndex: 2,
                },
                {
                  id: 'sq3',
                  type: 'true_false',
                  question: 'การโทรติดตาม Follow-up ควรโทรซ้ำได้สูงสุด 3 ครั้ง',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 0,
                },
                {
                  id: 'sq4',
                  type: 'multiple_choice',
                  question: 'ขั้นตอนแรกของ Consultative Selling 5 ขั้นตอนคืออะไร?',
                  options: ['Discover', 'Diagnose', 'Engage', 'Present'],
                  correctIndex: 2,
                },
              ],
            },
          },
        ],
      },
    ],
    finalExam: {
      id: 'final-sales-001',
      title: 'Final Exam: Sales Script',
      passingScore: 80,
      maxAttempts: 3,
      questions: [
        {
          id: 'sfe1',
          type: 'multiple_choice',
          question: 'กระบวนการ Consultative Selling มีกี่ขั้นตอน?',
          options: ['3 ขั้นตอน', '4 ขั้นตอน', '5 ขั้นตอน', '6 ขั้นตอน'],
          correctIndex: 2,
        },
        {
          id: 'sfe2',
          type: 'true_false',
          question: 'Alternative Close คือการให้ตัวเลือกแทนการถามว่าจะซื้อหรือไม่',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'sfe3',
          type: 'multiple_choice',
          question: '"โปรโมชันนี้มีแค่ถึงสิ้นเดือนนี้เท่านั้น" เป็น Closing Technique แบบใด?',
          options: ['Assumptive Close', 'Social Proof Close', 'Urgency Close', 'Summary Close'],
          correctIndex: 2,
        },
        {
          id: 'sfe4',
          type: 'multiple_choice',
          question: 'คำถามใดเป็นตัวอย่างของ Discovery Question ที่ดี?',
          options: [
            '"ซื้อเลยไหมครับ?"',
            '"ราคาแค่นี้ถูกมากเลย ซื้อไหม?"',
            '"ช่วงนี้มีอาการผิดปกติตรงไหนบ้างครับ?"',
            '"สินค้าเราดีที่สุดในตลาด ซื้อเลยดีกว่า"',
          ],
          correctIndex: 2,
        },
        {
          id: 'sfe5',
          type: 'true_false',
          question: 'Telesales ควรส่ง LINE ก่อนโทรเพื่อให้ลูกค้าคุ้นหน้า',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    id: 'course-claim-001',
    title: 'Claim & Compliance สำหรับผลิตภัณฑ์เสริมอาหาร',
    description: 'เรียนรู้ข้อกฎหมายและกฎระเบียบที่เกี่ยวข้องกับการโฆษณาผลิตภัณฑ์เสริมอาหาร พูดได้และพูดไม่ได้อะไรบ้าง',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop',
    duration: '2 ชั่วโมง',
    category: 'Claim & Compliance',
    status: 'published',
    allowedGroups: [],
    createdAt: '2024-02-10',
    modules: [
      {
        id: 'mod-claim-1',
        title: 'บทที่ 1: กฎหมายที่ต้องรู้',
        lessons: [
          {
            id: 'les-claim-1-1',
            title: 'พ.ร.บ. อาหาร และข้อห้ามในการโฆษณา',
            duration: '30 นาที',
            type: 'text',
            content: `**กฎหมายที่เกี่ยวข้องกับผลิตภัณฑ์เสริมอาหาร**

**พ.ร.บ. อาหาร พ.ศ. 2522 มาตรา 40**
ห้ามโฆษณาคุณประโยชน์ คุณภาพ หรือสรรพคุณของอาหารอันเป็นเท็จหรือเป็นการหลอกลวง

**ข้อห้ามสำคัญในการโฆษณา:**

❌ **พูดไม่ได้:**
• "รักษาโรค" หรือ "บำบัดโรค" ใดๆ
• อ้างว่าเป็น "ยา" หรือทำหน้าที่เหมือนยา
• "หาย", "หายขาด", "รักษาได้"
• อ้างตัวเลขที่ไม่มีหลักฐานทางวิทยาศาสตร์
• เปรียบเทียบกับผลิตภัณฑ์คู่แข่งในทางเสียหาย
• ใช้ภาพหรือคำรับรองจากบุคลากรทางการแพทย์ (โดยไม่ได้รับอนุญาต)

✅ **พูดได้:**
• "ช่วยบำรุง" หรือ "ช่วยสนับสนุน"
• "ส่งเสริมการทำงาน" ของอวัยวะ
• "ช่วยให้ร่างกายแข็งแรง"
• บอกส่วนประกอบและปริมาณที่แน่นอน
• อ้างอิงงานวิจัยที่ผ่านการรับรองแล้ว

**บทลงโทษ:**
- โทษปรับสูงสุด 200,000 บาท
- จำคุกสูงสุด 3 ปี
- หรือทั้งจำทั้งปรับ`,
          },
          {
            id: 'les-claim-1-2',
            title: 'Claim Cards ผลิตภัณฑ์หลัก',
            duration: '25 นาที',
            type: 'text',
            content: `**Claim Card: LiverMax Pro**

✅ พูดได้:
• "ช่วยบำรุงและสนับสนุนการทำงานของตับ"
• "มีส่วนช่วยปกป้องเซลล์ตับจากอนุมูลอิสระ"
• "ช่วยส่งเสริมการทำงานของตับในผู้ที่ดื่มแอลกอฮอล์เป็นประจำ"
• "สารสกัด Milk Thistle มีคุณสมบัติ Antioxidant"

❌ พูดไม่ได้:
• "รักษาโรคตับ"
• "ทำให้โรคตับหาย"
• "ดีที่สุดสำหรับตับ"
• "หมอแนะนำ" (ถ้าไม่มีหลักฐาน)

---

**Claim Card: JointCare Plus**

✅ พูดได้:
• "ช่วยบำรุงและสนับสนุนสุขภาพข้อและกระดูก"
• "มีส่วนช่วยเพิ่มความยืดหยุ่นของกระดูกอ่อน"
• "ช่วยส่งเสริมการเคลื่อนไหวของข้อต่อ"
• "Glucosamine เป็นส่วนประกอบสำคัญของกระดูกอ่อน"

❌ พูดไม่ได้:
• "รักษาโรคข้อเสื่อม"
• "ทำให้ข้อหายปวดถาวร"
• "แทนการผ่าตัด"
• "หยุดการเสื่อมสภาพของข้อ 100%"`,
            quiz: {
              id: 'quiz-claim-1-2',
              title: 'แบบทดสอบ: Claim & Compliance',
              passingScore: 80,
              maxAttempts: 3,
              questions: [
                {
                  id: 'cq1',
                  type: 'true_false',
                  question: 'สามารถพูดว่า "ผลิตภัณฑ์นี้รักษาโรคตับ" ได้ในการขาย',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 1,
                },
                {
                  id: 'cq2',
                  type: 'multiple_choice',
                  question: 'ข้อใดเป็น Claim ที่ถูกต้องตามกฎหมาย?',
                  options: [
                    '"ช่วยรักษาโรคตับ"',
                    '"ช่วยบำรุงและสนับสนุนการทำงานของตับ"',
                    '"หมอแนะนำ"',
                    '"ทำให้โรคตับหาย"',
                  ],
                  correctIndex: 1,
                },
                {
                  id: 'cq3',
                  type: 'multiple_choice',
                  question: 'โทษปรับสูงสุดสำหรับการโฆษณาผิดกฎหมายตาม พ.ร.บ. อาหาร คือเท่าไหร่?',
                  options: ['50,000 บาท', '100,000 บาท', '200,000 บาท', '500,000 บาท'],
                  correctIndex: 2,
                },
                {
                  id: 'cq4',
                  type: 'true_false',
                  question: 'สามารถพูดว่า "ช่วยส่งเสริมการเคลื่อนไหวของข้อต่อ" ได้',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 0,
                },
                {
                  id: 'cq5',
                  type: 'multiple_choice',
                  question: 'ข้อใดเป็นสิ่งที่ "พูดได้" ตาม Claim Card ของ JointCare Plus?',
                  options: [
                    '"รักษาโรคข้อเสื่อม"',
                    '"แทนการผ่าตัด"',
                    '"ช่วยบำรุงและสนับสนุนสุขภาพข้อ"',
                    '"หยุดการเสื่อมสภาพของข้อ 100%"',
                  ],
                  correctIndex: 2,
                },
              ],
            },
          },
        ],
      },
    ],
    finalExam: {
      id: 'final-claim-001',
      title: 'Final Exam: Claim & Compliance',
      passingScore: 85,
      maxAttempts: 3,
      questions: [
        {
          id: 'cfe1',
          type: 'true_false',
          question: 'พ.ร.บ. อาหาร มาตรา 40 ห้ามโฆษณาอาหารที่เป็นเท็จหรือหลอกลวง',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'cfe2',
          type: 'multiple_choice',
          question: 'ข้อใดคือ Claim ที่ผิดกฎหมาย?',
          options: [
            '"ช่วยบำรุงตับ"',
            '"มีสาร Antioxidant"',
            '"รักษาโรคตับหายขาด"',
            '"ส่งเสริมการทำงานของตับ"',
          ],
          correctIndex: 2,
        },
        {
          id: 'cfe3',
          type: 'true_false',
          question: 'สามารถอ้างว่าผลิตภัณฑ์เป็น "ยา" ได้ถ้าสรรพคุณดีจริง',
          options: ['ถูก', 'ผิด'],
          correctIndex: 1,
        },
        {
          id: 'cfe4',
          type: 'multiple_choice',
          question: 'บทลงโทษตาม พ.ร.บ. อาหาร สูงสุดคือ?',
          options: [
            'ปรับ 200,000 บาท',
            'จำคุก 3 ปี',
            'ปรับ 200,000 บาท หรือจำคุก 3 ปี หรือทั้งจำทั้งปรับ',
            'เพิกถอนใบอนุญาต',
          ],
          correctIndex: 2,
        },
        {
          id: 'cfe5',
          type: 'multiple_choice',
          question: 'ข้อความใดเหมาะสมสำหรับการโปรโมต JointCare Plus?',
          options: [
            '"แก้โรคข้อเสื่อมได้จริง"',
            '"ช่วยเพิ่มความยืดหยุ่นของกระดูกอ่อน"',
            '"หายปวดเข่าใน 1 สัปดาห์"',
            '"ดีกว่ายาแก้ปวด"',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'course-objection-001',
    title: 'การรับมือข้อโต้แย้งจากลูกค้า',
    description: 'เทคนิคและ Script สำหรับตอบข้อโต้แย้งที่พบบ่อย เช่น แพงไป เห็นผลเมื่อไหร่ ต่างจากคู่แข่งอย่างไร',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop',
    duration: '2.5 ชั่วโมง',
    category: 'Objection Handling',
    status: 'published',
    allowedGroups: ['Sales', 'Telesales', 'PC/BA', 'Live'],
    createdAt: '2024-02-20',
    modules: [
      {
        id: 'mod-obj-1',
        title: 'บทที่ 1: หลักการรับมือข้อโต้แย้ง',
        lessons: [
          {
            id: 'les-obj-1-1',
            title: 'ทำความเข้าใจข้อโต้แย้ง',
            duration: '15 นาที',
            type: 'text',
            content: `**ข้อโต้แย้งคือโอกาส ไม่ใช่อุปสรรค**

เมื่อลูกค้าโต้แย้ง นั่นหมายความว่าเขากำลัง "สนใจ" สินค้า แต่ยังมีข้อสงสัย

**ประเภทของข้อโต้แย้ง:**

1. **ข้อโต้แย้งเรื่องราคา** - "แพงเกินไป", "ไม่มีเงิน"
2. **ข้อโต้แย้งเรื่องประสิทธิภาพ** - "ได้ผลจริงไหม", "เห็นผลเมื่อไหร่"
3. **ข้อโต้แย้งเรื่องเวลา** - "ขอคิดดูก่อน", "ยังไม่พร้อม"
4. **ข้อโต้แย้งเรื่องความน่าเชื่อถือ** - "ไม่รู้จักยี่ห้อนี้", "ปลอดภัยไหม"
5. **ข้อโต้แย้งเรื่องการเปรียบเทียบ** - "คู่แข่งราคาถูกกว่า"

**สูตร ACA สำหรับรับมือข้อโต้แย้ง:**
- **A**cknowledge - รับรู้และเข้าใจ
- **C**larify - ชี้แจงและให้ข้อมูล
- **A**sk - ถามเพื่อยืนยันว่าตอบได้ครบ`,
          },
          {
            id: 'les-obj-1-2',
            title: 'Script รับมือข้อโต้แย้งที่พบบ่อย',
            duration: '30 นาที',
            type: 'text',
            content: `**Script สำหรับข้อโต้แย้งที่พบบ่อย**

---

**"แพงไป" / "ราคาสูงเกินไป"**

❌ อย่าพูด: "แต่มันดีนะครับ" หรือ "ก็ราคามันเป็นแบบนี้"

✅ Script ที่ดี:
"เข้าใจครับ/ค่ะ ลูกค้าหลายท่านก็รู้สึกแบบนี้เหมือนกัน จริงๆ แล้วถ้าเทียบต่อวันแล้ว LiverMax Pro ราคาแค่วันละ 30 บาทเองครับ/ค่ะ น้อยกว่าค่ากาแฟสักแก้วด้วยซ้ำ และเมื่อเทียบกับค่ารักษาพยาบาลถ้าตับมีปัญหาในอนาคต ถือว่าคุ้มมากเลยครับ/ค่ะ"

---

**"เห็นผลเมื่อไหร่" / "ได้ผลจริงไหม"**

✅ Script ที่ดี:
"ขึ้นอยู่กับแต่ละคนครับ/ค่ะ โดยทั่วไปลูกค้าส่วนใหญ่เริ่มรู้สึกว่าไม่เหนื่อยง่ายและรู้สึกสดชื่นขึ้นภายใน 2-4 สัปดาห์แรก สำหรับผลระยะยาวของตับ แนะนำใช้ต่อเนื่อง 3 เดือนจะเห็นผลชัดเจนครับ/ค่ะ"

---

**"ขอคิดดูก่อน"**

✅ Script ที่ดี:
"แน่นอนครับ/ค่ะ แต่ขอถามว่ายังมีข้อสงสัยตรงไหนอยู่ไหมครับ/ค่ะ? เผื่อผม/หนูจะช่วยให้ข้อมูลเพิ่มเติมได้..."

---

**"คู่แข่งราคาถูกกว่า"**

✅ Script ที่ดี:
"ใช่ครับ/ค่ะ ราคาอาจต่างกัน แต่ขอเปรียบเทียบให้ฟัง LiverMax Pro มี Milk Thistle 300mg ต่อครั้ง ในขณะที่หลายยี่ห้อมีแค่ 150mg โดยราคาที่ต่างกันแค่เล็กน้อย คุณได้ปริมาณสารสำคัญมากกว่าถึง 2 เท่าเลยครับ/ค่ะ"`,
            quiz: {
              id: 'quiz-obj-1-2',
              title: 'แบบทดสอบ: Objection Handling',
              passingScore: 70,
              maxAttempts: 3,
              questions: [
                {
                  id: 'oq1',
                  type: 'multiple_choice',
                  question: 'สูตร ACA ในการรับมือข้อโต้แย้งย่อมาจากอะไร?',
                  options: [
                    'Accept, Clarify, Ask',
                    'Acknowledge, Clarify, Ask',
                    'Answer, Confirm, Agree',
                    'Avoid, Counter, Argue',
                  ],
                  correctIndex: 1,
                },
                {
                  id: 'oq2',
                  type: 'true_false',
                  question: 'เมื่อลูกค้าโต้แย้ง นั่นหมายความว่าลูกค้าสนใจสินค้า',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 0,
                },
                {
                  id: 'oq3',
                  type: 'multiple_choice',
                  question: 'เมื่อลูกค้าบอกว่า "แพงไป" วิธีที่ถูกต้องคืออะไร?',
                  options: [
                    'ลดราคาทันที',
                    'ถกเถียงว่าราคาไม่แพง',
                    'เปรียบเทียบต้นทุนต่อวันและมูลค่าที่ได้รับ',
                    'บอกว่าไม่มีราคาถูกกว่านี้',
                  ],
                  correctIndex: 2,
                },
              ],
            },
          },
        ],
      },
    ],
    finalExam: {
      id: 'final-obj-001',
      title: 'Final Exam: Objection Handling',
      passingScore: 80,
      maxAttempts: 3,
      questions: [
        {
          id: 'ofe1',
          type: 'multiple_choice',
          question: 'ข้อโต้แย้ง "เห็นผลเมื่อไหร่" ควรตอบอย่างไร?',
          options: [
            '"เห็นผลเลยครับ"',
            '"ขึ้นอยู่กับแต่ละคน ส่วนใหญ่ 2-4 สัปดาห์แรกจะเริ่มรู้สึก แนะนำใช้ 3 เดือน"',
            '"ไม่แน่ใจครับ"',
            '"ถ้าไม่เห็นผลคืนเงิน"',
          ],
          correctIndex: 1,
        },
        {
          id: 'ofe2',
          type: 'true_false',
          question: 'เมื่อลูกค้าบอก "ขอคิดดูก่อน" ควรถามว่ายังมีข้อสงสัยอะไรอยู่',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'ofe3',
          type: 'multiple_choice',
          question: 'ข้อโต้แย้งประเภทใดที่ต้องใช้ข้อมูลเปรียบเทียบ?',
          options: [
            'ข้อโต้แย้งเรื่องเวลา',
            'ข้อโต้แย้งเรื่องการเปรียบเทียบคู่แข่ง',
            'ข้อโต้แย้งเรื่องเวลา',
            'ข้อโต้แย้งเรื่องความน่าเชื่อถือ',
          ],
          correctIndex: 1,
        },
        {
          id: 'ofe4',
          type: 'multiple_choice',
          question: 'ขั้นตอน "A" แรกในสูตร ACA คือ?',
          options: ['Answer คำถาม', 'Acknowledge รับรู้และเข้าใจ', 'Argue โต้แย้ง', 'Avoid หลีกเลี่ยง'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'course-newproduct-001',
    title: 'New Product Launch: EyeCare Vision Pro',
    description: 'ทำความรู้จักกับผลิตภัณฑ์ใหม่ล่าสุดสำหรับดูแลสุขภาพดวงตา เหมาะสำหรับผู้ใช้ screen time สูง',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    duration: '1.5 ชั่วโมง',
    category: 'New Product Launch',
    status: 'published',
    allowedGroups: [],
    createdAt: '2024-03-01',
    modules: [
      {
        id: 'mod-eye-1',
        title: 'บทที่ 1: ภาพรวม EyeCare Vision Pro',
        lessons: [
          {
            id: 'les-eye-1-1',
            title: 'ทำไม EyeCare Vision Pro ถึงมาตอนนี้',
            duration: '20 นาที',
            type: 'text',
            content: `**Market Insight: ดวงตาในยุค Digital**

**ตัวเลขที่น่าตกใจ:**
• คนไทยใช้เวลากับหน้าจอเฉลี่ย 8+ ชั่วโมง/วัน
• 70% ของคนทำงานมีอาการ Digital Eye Strain
• ปัญหาสายตาสั้นในเด็กไทยเพิ่มขึ้น 30% ใน 5 ปี
• ตลาดผลิตภัณฑ์ดูแลดวงตาเติบโต 25%/ปี

**ความต้องการของตลาด:**
ผู้บริโภคมองหาผลิตภัณฑ์ที่:
✓ ลดอาการล้าตา แสบตา
✓ ป้องกันผลเสียจากแสง Blue Light
✓ บำรุงกระจกตาและจอประสาทตา
✓ ใช้ง่าย ไม่ต้องหยอดตา

**นี่คือโอกาสของเรา → EyeCare Vision Pro**`,
          },
          {
            id: 'les-eye-1-2',
            title: 'ส่วนประกอบและจุดขายของ EyeCare Vision Pro',
            duration: '25 นาที',
            type: 'text',
            content: `**EyeCare Vision Pro - Formulation**

🔵 **Lutein 20 mg + Zeaxanthin 4 mg**
- Carotenoid ที่พบในจอประสาทตา
- กรองแสง Blue Light จากหน้าจอ
- ป้องกัน Macular Degeneration
- งานวิจัย: AREDS2 Study รับรอง

🔵 **Astaxanthin 6 mg**
- Antioxidant ที่แรงกว่า Vitamin E 6,000 เท่า
- ลดอาการล้าตาและปรับ Focus ได้เร็วขึ้น
- ช่วยไหลเวียนเลือดไปเลี้ยงดวงตา

🔵 **Bilberry Extract 160 mg (25% Anthocyanosides)**
- บำรุงการมองเห็นในที่มืด
- ต้านอนุมูลอิสระในดวงตา
- ใช้กันมากในยุโรปสำหรับนักบินและทหาร

🔵 **Vitamin A (Beta-Carotene) 5,000 IU**
- สำคัญสำหรับการมองเห็นในที่มืด
- บำรุงกระจกตา
- ป้องกันตาแห้ง

**วิธีใช้:**
- รับประทาน 1 Softgel วันละ 1 ครั้ง หลังอาหาร

**ราคา:** 990 บาท/30 Softgels
**Launch Date:** 1 มีนาคม 2024`,
            quiz: {
              id: 'quiz-eye-1-2',
              title: 'แบบทดสอบ: EyeCare Vision Pro',
              passingScore: 70,
              maxAttempts: 3,
              questions: [
                {
                  id: 'eq1',
                  type: 'multiple_choice',
                  question: 'Lutein ใน EyeCare Vision Pro มีปริมาณเท่าไหร่?',
                  options: ['10 mg', '20 mg', '30 mg', '40 mg'],
                  correctIndex: 1,
                },
                {
                  id: 'eq2',
                  type: 'true_false',
                  question: 'Astaxanthin มีฤทธิ์ Antioxidant แรงกว่า Vitamin E ถึง 6,000 เท่า',
                  options: ['ถูก', 'ผิด'],
                  correctIndex: 0,
                },
                {
                  id: 'eq3',
                  type: 'multiple_choice',
                  question: 'EyeCare Vision Pro มีราคากี่บาทต่อกล่อง?',
                  options: ['790 บาท', '890 บาท', '990 บาท', '1,090 บาท'],
                  correctIndex: 2,
                },
                {
                  id: 'eq4',
                  type: 'multiple_choice',
                  question: 'Bilberry Extract ใน EyeCare Vision Pro ช่วยอะไรเป็นหลัก?',
                  options: ['เพิ่มความชุ่มชื้นตา', 'บำรุงการมองเห็นในที่มืด', 'รักษาต้อหิน', 'ป้องกันตาเหล่'],
                  correctIndex: 1,
                },
              ],
            },
          },
        ],
      },
    ],
    finalExam: {
      id: 'final-eye-001',
      title: 'Final Exam: EyeCare Vision Pro',
      passingScore: 80,
      maxAttempts: 3,
      questions: [
        {
          id: 'efe1',
          type: 'multiple_choice',
          question: 'คนไทยใช้เวลากับหน้าจอเฉลี่ยวันละกี่ชั่วโมง?',
          options: ['4+ ชั่วโมง', '6+ ชั่วโมง', '8+ ชั่วโมง', '10+ ชั่วโมง'],
          correctIndex: 2,
        },
        {
          id: 'efe2',
          type: 'true_false',
          question: 'Lutein และ Zeaxanthin ช่วยกรองแสง Blue Light จากหน้าจอ',
          options: ['ถูก', 'ผิด'],
          correctIndex: 0,
        },
        {
          id: 'efe3',
          type: 'multiple_choice',
          question: 'EyeCare Vision Pro วิธีรับประทานที่ถูกต้องคือ?',
          options: [
            '2 เม็ด วันละ 2 ครั้ง',
            '1 Softgel วันละ 1 ครั้ง หลังอาหาร',
            '1 เม็ด 3 ครั้งต่อวัน',
            '2 Softgel ก่อนนอน',
          ],
          correctIndex: 1,
        },
        {
          id: 'efe4',
          type: 'multiple_choice',
          question: 'ผลิตภัณฑ์ EyeCare Vision Pro เปิดตัววันไหน?',
          options: ['1 มกราคม 2024', '1 กุมภาพันธ์ 2024', '1 มีนาคม 2024', '1 เมษายน 2024'],
          correctIndex: 2,
        },
        {
          id: 'efe5',
          type: 'multiple_choice',
          question: 'สารใดใน EyeCare Vision Pro มี Antioxidant แรงที่สุด?',
          options: ['Lutein', 'Vitamin A', 'Bilberry Extract', 'Astaxanthin'],
          correctIndex: 3,
        },
      ],
    },
  },
];
