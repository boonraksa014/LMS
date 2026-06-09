export interface ActionDef { id: string; label: string }
export interface MenuDef   { id: string; label: string; section: string; actions: ActionDef[] }
export interface RoleConfig {
  id: string;
  label: string;
  description: string;
  isSystem: boolean;
  permissions: Record<string, Record<string, boolean>>;
}

export const MENU_DEFS: MenuDef[] = [
  { id: 'admin.overview',     label: 'ภาพรวมระบบ',           section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูข้อมูล' }] },
  { id: 'admin.users',        label: 'จัดการผู้ใช้งาน',       section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายชื่อ' }, { id: 'create', label: 'เพิ่มผู้ใช้' }, { id: 'edit', label: 'แก้ไขข้อมูล' }, { id: 'import', label: 'นำเข้าไฟล์' }] },
  { id: 'admin.courses',      label: 'จัดการคอร์ส',           section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'สร้างคอร์ส' }, { id: 'edit', label: 'แก้ไข' }, { id: 'manage_content', label: 'จัดการเนื้อหา' }, { id: 'duplicate', label: 'ทำสำเนา' }] },
  { id: 'admin.reports',      label: 'รายงานความก้าวหน้า',    section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายงาน' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'admin.certificates', label: 'ใบประกาศนียบัตร',        section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'admin.groups',       label: 'จัดการกลุ่มผู้เรียน',   section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'เพิ่มกลุ่ม' }, { id: 'edit', label: 'แก้ไข' }, { id: 'delete', label: 'ลบ' }] },
  { id: 'admin.categories',   label: 'จัดการหมวดหมู่',         section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'create', label: 'เพิ่ม' }, { id: 'edit', label: 'แก้ไข' }, { id: 'delete', label: 'ลบ' }] },
  { id: 'admin.roles',        label: 'จัดการบทบาทและสิทธิ์',  section: 'ผู้ดูแลระบบ', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'edit', label: 'แก้ไขสิทธิ์' }] },
  { id: 'manager.dashboard',  label: 'รายงานทีม',              section: 'ผู้จัดการ',   actions: [{ id: 'view', label: 'ดูรายงาน' }, { id: 'export', label: 'ส่งออก CSV' }] },
  { id: 'learner.home',       label: 'หน้าแรก',                section: 'การเรียนรู้', actions: [{ id: 'view', label: 'ดูภาพรวม' }] },
  { id: 'learner.catalog',    label: 'คอร์สทั้งหมด',           section: 'การเรียนรู้', actions: [{ id: 'view', label: 'ดูรายการ' }, { id: 'enroll', label: 'ลงทะเบียน' }] },
  { id: 'learner.lesson',     label: 'เนื้อหาบทเรียน',         section: 'การเรียนรู้', actions: [{ id: 'view', label: 'เข้าเรียน' }, { id: 'quiz', label: 'ทำแบบทดสอบ' }] },
];

export const _sp = (allowed: Record<string, string[]>): Record<string, Record<string, boolean>> =>
  Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, !!(allowed[m.id]?.includes(a.id))]))]));

export const INITIAL_ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'super_admin', label: 'Super Admin',
    description: 'สิทธิ์สูงสุด — เข้าถึงและดำเนินการได้ทุกฟังก์ชัน', isSystem: true,
    permissions: Object.fromEntries(MENU_DEFS.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a.id, true]))])),
  },
  {
    id: 'training_admin', label: 'Training Admin',
    description: 'จัดการคอร์ส รายงาน และเนื้อหาการเรียนรู้', isSystem: false,
    permissions: _sp({
      'admin.overview': ['view'], 'admin.courses': ['view','create','edit','manage_content','duplicate'],
      'admin.reports': ['view','export'], 'admin.certificates': ['view'],
      'admin.groups': ['view'], 'admin.categories': ['view','create','edit'],
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
  {
    id: 'manager', label: 'Manager',
    description: 'ติดตามความก้าวหน้าและดูรายงานของทีม', isSystem: false,
    permissions: _sp({
      'manager.dashboard': ['view','export'],
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
  {
    id: 'learner', label: 'ผู้เรียน',
    description: 'เข้าเรียนและทำแบบทดสอบตามคอร์สที่ได้รับมอบหมาย', isSystem: false,
    permissions: _sp({
      'learner.home': ['view'], 'learner.catalog': ['view','enroll'], 'learner.lesson': ['view','quiz'],
    }),
  },
];