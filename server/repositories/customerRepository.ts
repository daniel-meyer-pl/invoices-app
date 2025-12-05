import { prisma } from '../utils/prisma'
import type { Customer } from '../../types/invoice'

const PublicCustomerFields = {
  id: true,
  userId: true,
  firstname: true,
  lastname: true,
  companyName: true,
  address: true,
  nip: true,
}

export async function findCustomersByUserId(userId: string): Promise<Customer[]> {
  return prisma.customer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: PublicCustomerFields,
  })
}

export async function findCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    select: PublicCustomerFields,
  })
}

export async function createCustomer(userId: string, data: Partial<Customer>) {
  return prisma.customer.create({
    data: {
      userId,
      firstname: data.firstname ?? null,
      lastname: data.lastname ?? null,
      companyName: data.companyName ?? null,
      address: data.address ?? null,
      nip: data.nip ?? null,
    },
    select: PublicCustomerFields,
  })
}

export async function updateCustomerById(id: string, data: Partial<Customer>) {
  return prisma.customer.update({
    where: { id },
    data: {
      ...(data.firstname !== undefined ? { firstname: data.firstname } : {}),
      ...(data.lastname !== undefined ? { lastname: data.lastname } : {}),
      ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.nip !== undefined ? { nip: data.nip } : {}),
    },
    select: PublicCustomerFields,
  })
}

export async function deleteCustomerById(id: string) {
  await prisma.customer.delete({ where: { id } })
}
