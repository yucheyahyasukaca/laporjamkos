export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            classes: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    token: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    token?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    token?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    created_at: string
                    class_id: string
                    status: 'pending' | 'resolved' | 'giving_task' | 'contacting_teacher'
                    picket_name: string | null
                    missing_teacher_name: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    class_id: string
                    status?: 'pending' | 'resolved' | 'giving_task' | 'contacting_teacher'
                    picket_name?: string | null
                    missing_teacher_name?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    class_id?: string
                    status?: 'pending' | 'resolved' | 'giving_task' | 'contacting_teacher'
                    picket_name?: string | null
                    missing_teacher_name?: string | null
                }
            }
        }
    }
}

export type Class = Database['public']['Tables']['classes']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
