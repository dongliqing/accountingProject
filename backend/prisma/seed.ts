import 'dotenv/config';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { BillType, PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

/**
 * 前端登录前会对密码做一次 SHA-256，后端再用 bcrypt 比对。
 * 种子数据必须按同样流程生成，否则登录不上。
 */
function hashLoginPassword(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

/** 默认分类：名称 / 类型 / 图标 / 底色，与设计稿保持一致 */
const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: BillType;
  icon: string;
  color: string;
}> = [
  { name: '餐饮', type: BillType.EXPENSE, icon: '🍚', color: '#FFF1D6' },
  { name: '交通', type: BillType.EXPENSE, icon: '🚌', color: '#E8F4FF' },
  { name: '购物', type: BillType.EXPENSE, icon: '🛍️', color: '#FFE9EF' },
  { name: '娱乐', type: BillType.EXPENSE, icon: '🎮', color: '#F2ECFF' },
  { name: '居住', type: BillType.EXPENSE, icon: '🏠', color: '#E9F7EF' },
  { name: '医疗', type: BillType.EXPENSE, icon: '💊', color: '#FFECEB' },
  { name: '学习', type: BillType.EXPENSE, icon: '📚', color: '#E9F1FF' },
  { name: '其他支出', type: BillType.EXPENSE, icon: '💸', color: '#F4F1E8' },
  { name: '工资', type: BillType.INCOME, icon: '💼', color: '#E9F7EF' },
  { name: '红包', type: BillType.INCOME, icon: '🧧', color: '#FFECEB' },
  { name: '理财', type: BillType.INCOME, icon: '📈', color: '#E8F4FF' },
  { name: '其他收入', type: BillType.INCOME, icon: '💰', color: '#FFF6D6' },
];

async function main() {
  // 1) 管理员账号
  const passwordHash = await bcrypt.hash(hashLoginPassword(ADMIN_PASSWORD), 10);

  const admin = await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      email: `${ADMIN_USERNAME}@example.com`,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // 2) 默认账本
  const ledger = await prisma.ledger.upsert({
    where: { userId_name: { userId: admin.id, name: '日常账本' } },
    update: {},
    create: {
      userId: admin.id,
      name: '日常账本',
      description: '默认账本 · 日常收支',
      color: '#FEDA44',
      isDefault: true,
    },
  });

  // 3) 默认分类
  const categoryIdByName = new Map<string, string>();
  for (const [index, item] of DEFAULT_CATEGORIES.entries()) {
    const category = await prisma.category.upsert({
      where: {
        ledgerId_type_name: {
          ledgerId: ledger.id,
          type: item.type,
          name: item.name,
        },
      },
      update: {},
      create: {
        ledgerId: ledger.id,
        name: item.name,
        type: item.type,
        icon: item.icon,
        color: item.color,
        sortOrder: index,
        isSystem: true,
      },
    });
    categoryIdByName.set(item.name, category.id);
  }

  // 4) 示例账单（仅首次初始化时写入，方便前端联调）
  const billCount = await prisma.bill.count({ where: { userId: admin.id } });
  if (billCount === 0) {
    const now = new Date();
    const at = (monthOffset: number, day: number) =>
      new Date(now.getFullYear(), now.getMonth() - monthOffset, day, 12, 0, 0);

    await prisma.bill.createMany({
      data: [
        {
          userId: admin.id,
          ledgerId: ledger.id,
          categoryId: categoryIdByName.get('工资'),
          type: BillType.INCOME,
          amount: 12000,
          note: '本月工资',
          occurredAt: at(0, 5),
        },
        {
          userId: admin.id,
          ledgerId: ledger.id,
          categoryId: categoryIdByName.get('餐饮'),
          type: BillType.EXPENSE,
          amount: 32.5,
          note: '午餐',
          occurredAt: at(0, 6),
        },
        {
          userId: admin.id,
          ledgerId: ledger.id,
          categoryId: categoryIdByName.get('交通'),
          type: BillType.EXPENSE,
          amount: 6,
          note: '地铁通勤',
          occurredAt: at(0, 6),
        },
        {
          userId: admin.id,
          ledgerId: ledger.id,
          categoryId: categoryIdByName.get('购物'),
          type: BillType.EXPENSE,
          amount: 268,
          note: '日用品补货',
          occurredAt: at(0, 8),
        },
        {
          userId: admin.id,
          ledgerId: ledger.id,
          categoryId: categoryIdByName.get('餐饮'),
          type: BillType.EXPENSE,
          amount: 88,
          note: '周末聚餐',
          occurredAt: at(1, 21),
        },
      ],
    });
  }

  console.log('');
  console.log('  ✅ 种子数据初始化完成');
  console.log(`  👤 登录账号：${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
  console.log(`  📒 默认账本：${ledger.name}`);
  console.log(`  🗂️ 默认分类：${DEFAULT_CATEGORIES.length} 个`);
  console.log('');
}

main()
  .catch((error) => {
    console.error('种子数据初始化失败：', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
