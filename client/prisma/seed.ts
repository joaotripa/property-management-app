import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Starting fixed categories seed data...')

  // Property Income Categories (MVP - Essential only)
  const incomeCategories = [
    {
      name: 'Rental Income',
      type: TransactionType.INCOME,
      description: 'Monthly rental payments from tenants',
    },
    {
      name: 'Security Deposit',
      type: TransactionType.INCOME,
      description: 'Tenant security deposits received',
    },
    {
      name: 'Late Payment Fee',
      type: TransactionType.INCOME,
      description: 'Penalties for late rent payments',
    },
    {
      name: 'Other Income',
      type: TransactionType.INCOME,
      description: 'Other property-related income (parking, storage, utility reimbursements, insurance claims, etc.)',
    },
  ]

  // Property Expense Categories (MVP - Essential only)
  const expenseCategories = [
    {
      name: 'Maintenance',
      type: TransactionType.EXPENSE,
      description: 'Property maintenance, repairs, renovations, cleaning, and garden upkeep',
    },
    {
      name: 'Utilities',
      type: TransactionType.EXPENSE,
      description: 'Electricity, gas, water, internet, waste management, and other utilities',
    },
    {
      name: 'Taxes',
      type: TransactionType.EXPENSE,
      description: 'Property taxes, municipal fees, and government charges',
    },
    {
      name: 'Insurance',
      type: TransactionType.EXPENSE,
      description: 'Property insurance, landlord insurance, and liability coverage',
    },
    {
      name: 'Property Management',
      type: TransactionType.EXPENSE,
      description: 'Management fees, letting agent fees, advertising, and tenant screening',
    },
    {
      name: 'Community Charges',
      type: TransactionType.EXPENSE,
      description: 'Condominium fees, building maintenance, and community assessments',
    },
    {
      name: 'Mortgage Interest',
      type: TransactionType.EXPENSE,
      description: 'Mortgage interest payments for this property',
    },
    {
      name: 'Capital Improvements',
      type: TransactionType.EXPENSE,
      description: 'Major improvements, renovations, and furnishing',
    },
    {
      name: 'Other',
      type: TransactionType.EXPENSE,
      description: 'Other property expenses (legal fees, travel, vacancy costs, etc.)',
    },
  ]

  const allCategories = [...incomeCategories, ...expenseCategories]

  console.log(`📦 Creating ${allCategories.length} fixed categories for all users...`)

  for (const category of allCategories) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: category.name,
        type: category.type,
      },
    })
    
    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: category.type,
          description: category.description,
        },
      })
      console.log(`✓ Created category: ${category.name}`)
    } else {
      await prisma.category.update({
        where: {
          id: existingCategory.id,
        },
        data: {
          description: category.description,
          isActive: true,
        },
      })
      console.log(`↻ Updated category: ${category.name}`)
    }
  }

  console.log('✅ Fixed categories seed data completed!')
  console.log(`📊 Created ${incomeCategories.length} income categories`)
  console.log(`💰 Created ${expenseCategories.length} expense categories`)
  console.log('🎯 All users will share these curated categories')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })