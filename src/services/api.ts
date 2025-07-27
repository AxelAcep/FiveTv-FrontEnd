const BASE_URL = import.meta.env.API_BASE_URL

// GET example
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

// POST example
export async function createUser(data: { name: string; email: string }) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}
