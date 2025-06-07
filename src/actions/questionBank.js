import { createClient } from '../utils/supabase/client'

export const getQuestionList = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
  if (error) {
    console.error('Error fetching questions:', error)
    return { status: 'error', message: error.message, questions: [] }
  }

  return { status: 'success', questions: data }
}
