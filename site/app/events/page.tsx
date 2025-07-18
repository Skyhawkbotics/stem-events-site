import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select()

  return <pre>{JSON.stringify(events, null, 2)}</pre>
}