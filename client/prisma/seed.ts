import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Starting fixed categories seed data...')

  // Property Income Categories
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
      name: 'Utility Reimbursement',
      type: TransactionType.INCOME,
      description: 'Utilities paid by landlord and recharged to tenant',
    },
    {
      name: 'Parking Rental',
      type: TransactionType.INCOME,
      description: 'Additional income from parking spaces',
    },
    {
      name: 'Storage Rental',
      type: TransactionType.INCOME,
      description: 'Additional income from storage spaces/cellars',
    },
    {
      name: 'Insurance Claim',
      type: TransactionType.INCOME,
      description: 'Insurance payouts for property damage',
    },
    {
      name: 'Other Income',
      type: TransactionType.INCOME,
      description: 'Other property-related income',
    },
  ]

  // Property Expense Categories
  const expenseCategories = [
    // Property Maintenance & Repairs
    {
      name: 'Maintenance & Repairs',
      type: TransactionType.EXPENSE,
      description: 'Property maintenance and repair costs',
    },
    {
      name: 'Emergency Repairs',
      type: TransactionType.EXPENSE,
      description: 'Urgent repairs (plumbing, heating, electrical)',
    },
    {
      name: 'Renovations',
      type: TransactionType.EXPENSE,
      description: 'Property improvements and renovations',
    },
    {
      name: 'Cleaning',
      type: TransactionType.EXPENSE,
      description: 'Professional cleaning between tenants',
    },
    {
      name: 'Garden Maintenance',
      type: TransactionType.EXPENSE,
      description: 'Garden and exterior maintenance',
    },

    // Property Utilities (if paid by landlord)
    {
      name: 'Electricity',
      type: TransactionType.EXPENSE,
      description: 'Electricity bills for this property',
    },
    {
      name: 'Gas',
      type: TransactionType.EXPENSE,
      description: 'Gas bills for this property',
    },
    {
      name: 'Water & Sewage',
      type: TransactionType.EXPENSE,
      description: 'Water and sewage charges for this property',
    },
    {
      name: 'Internet & TV',
      type: TransactionType.EXPENSE,
      description: 'Internet and TV services for this property',
    },
    {
      name: 'Waste Management',
      type: TransactionType.EXPENSE,
      description: 'Garbage collection fees for this property',
    },

    // Property Taxes & Fees
    {
      name: 'Property Tax',
      type: TransactionType.EXPENSE,
      description: 'Annual property taxes (IBI, IMI, council tax)',
    },
    {
      name: 'Municipal Fees',
      type: TransactionType.EXPENSE,
      description: 'City fees and local taxes for this property',
    },

    // Property Insurance
    {
      name: 'Building Insurance',
      type: TransactionType.EXPENSE,
      description: 'Property insurance premiums',
    },
    {
      name: 'Landlord Insurance',
      type: TransactionType.EXPENSE,
      description: 'Landlord liability insurance for this property',
    },

    // Building/Community Charges
    {
      name: 'Community Charges',
      type: TransactionType.EXPENSE,
      description: 'Monthly condominium/building management fees',
    },
    {
      name: 'Lift Maintenance',
      type: TransactionType.EXPENSE,
      description: 'Elevator maintenance fees for this building',
    },
    {
      name: 'Building Repairs',
      type: TransactionType.EXPENSE,
      description: 'Special assessments for building repairs',
    },

    // Property-Specific Services
    {
      name: 'Property Management Fee',
      type: TransactionType.EXPENSE,
      description: 'Management company fees for this property',
    },
    {
      name: 'Letting Agent Fee',
      type: TransactionType.EXPENSE,
      description: 'Agent fees for finding tenants for this property',
    },
    {
      name: 'Property Advertising',
      type: TransactionType.EXPENSE,
      description: 'Advertising costs for this property',
    },
    {
      name: 'Tenant Screening',
      type: TransactionType.EXPENSE,
      description: 'Credit checks and references for this property',
    },

    // Property Mortgage & Finance
    {
      name: 'Mortgage Interest',
      type: TransactionType.EXPENSE,
      description: 'Mortgage interest for this property',
    },
    {
      name: 'Mortgage Principal',
      type: TransactionType.EXPENSE,
      description: 'Mortgage principal payments for this property',
    },

    // Property-Specific Legal & Professional
    {
      name: 'Legal Fees',
      type: TransactionType.EXPENSE,
      description: 'Legal costs related to this property (evictions, contracts)',
    },
    {
      name: 'Property Valuation',
      type: TransactionType.EXPENSE,
      description: 'Professional valuation of this property',
    },
    {
      name: 'Safety Certificates',
      type: TransactionType.EXPENSE,
      description: 'Gas, electrical, EPC certificates for this property',
    },

    // Property Travel
    {
      name: 'Property Visits',
      type: TransactionType.EXPENSE,
      description: 'Travel costs to visit this specific property',
    },

    // Other Property Expenses
    {
      name: 'Furnishing',
      type: TransactionType.EXPENSE,
      description: 'Furniture and appliances for this property',
    },
    {
      name: 'Void Period Costs',
      type: TransactionType.EXPENSE,
      description: 'Costs during vacancy (utilities, council tax)',
    },
    {
      name: 'Other Expense',
      type: TransactionType.EXPENSE,
      description: 'Other property-specific expenses',
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