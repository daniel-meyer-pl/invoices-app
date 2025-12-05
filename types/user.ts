export type PublicUser = {
  id: string
  email: string
  fullname: string | null
  avatar: string | null
  companyName: string | null
  bankAccountNumber: string | null
  address: string | null
  nip: string | null
}

export type InsertUserData = Pick<PublicUser, 'email' | 'fullname' | 'avatar'>

export type UserApiResponse = {
  user?: PublicUser
  loggedIn: boolean
}