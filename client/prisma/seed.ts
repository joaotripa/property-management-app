import { PrismaClient } from '@prisma/client'
import { TransactionType } from "@/types/transactions";


const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Starting seed data...')

  // Seed currencies first
  console.log('💰 Seeding currencies...')

  const currencies = [
    {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
    },
    {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
    },
    {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
    },
    {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar',
    },
    {
      code: 'CAD',
      symbol: 'C$',
      name: 'Canadian Dollar',
    },
    {
      code: 'CHF',
      symbol: 'Fr',
      name: 'Swiss Franc',
    },
  ]

  for (const currency of currencies) {
    const existingCurrency = await prisma.currency.findUnique({
      where: { code: currency.code },
    })

    if (!existingCurrency) {
      await prisma.currency.create({
        data: currency,
      })
      console.log(`✓ Created currency: ${currency.name} (${currency.code})`)
    } else {
      await prisma.currency.update({
        where: { code: currency.code },
        data: {
          symbol: currency.symbol,
          name: currency.name,
          isActive: true,
        },
      })
      console.log(`↻ Updated currency: ${currency.name} (${currency.code})`)
    }
  }

  // Seed timezones
  console.log('🌍 Seeding timezones...')

  const timezones = [
    {
      iana: 'Europe/London',
      label: 'London (GMT+0)',
    },
    {
      iana: 'Europe/Paris',
      label: 'Paris (GMT+1)',
    },
    {
      iana: 'Europe/Berlin',
      label: 'Berlin (GMT+1)',
    },
    {
      iana: 'Europe/Zurich',
      label: 'Zurich (GMT+1)',
    },
    {
      iana: 'America/New_York',
      label: 'New York (GMT-5)',
    },
    {
      iana: 'America/Chicago',
      label: 'Chicago (GMT-6)',
    },
    {
      iana: 'America/Denver',
      label: 'Denver (GMT-7)',
    },
    {
      iana: 'America/Los_Angeles',
      label: 'Los Angeles (GMT-8)',
    },
    {
      iana: 'Australia/Sydney',
      label: 'Sydney (GMT+11)',
    },
    {
      iana: 'Australia/Melbourne',
      label: 'Melbourne (GMT+11)',
    },
  ]

  for (const timezone of timezones) {
    const existingTimezone = await prisma.timezone.findUnique({
      where: { iana: timezone.iana },
    })

    if (!existingTimezone) {
      await prisma.timezone.create({
        data: timezone,
      })
      console.log(`✓ Created timezone: ${timezone.label} (${timezone.iana})`)
    } else {
      await prisma.timezone.update({
        where: { iana: timezone.iana },
        data: {
          label: timezone.label,
          isActive: true,
        },
      })
      console.log(`↻ Updated timezone: ${timezone.label} (${timezone.iana})`)
    }
  }

  console.log('📝 Starting categories seed data...')

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
      name: 'Condominium Fees',
      type: TransactionType.EXPENSE,
      description: 'Monthly building maintenance fees and community charges',
    },
    {
      name: 'Mortgage Payment',
      type: TransactionType.EXPENSE,
      description: 'Monthly mortgage payments (principal and interest)',
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

  console.log('✅ Seed data completed!')
  console.log(`💰 Created ${currencies.length} currencies`)
  console.log(`🌍 Created ${timezones.length} timezones`)
  console.log(`📊 Created ${incomeCategories.length} income categories`)
  console.log(`💸 Created ${expenseCategories.length} expense categories`)
  console.log('🎯 All users will share these curated currencies, timezones, and categories')
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