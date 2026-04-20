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
      profiles: {
        Row: {
          id: string
          display_name: string
          bio: string | null
          riot_name: string | null
          riot_tag: string | null
          rank: string | null
          rank_tier: string | null
          peak_rank: string | null
          agent_mains: string[] | null
          discord_tag: string | null
          region: string
          avatar_url: string | null
          looking_for_rank_min: string | null
          looking_for_rank_max: string | null
          looking_for: string | null
          is_admin: boolean | null
          languages: string[] | null
          playstyle: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          bio?: string | null
          riot_name?: string | null
          riot_tag?: string | null
          rank?: string | null
          rank_tier?: string | null
          peak_rank?: string | null
          agent_mains?: string[] | null
          discord_tag?: string | null
          region?: string
          avatar_url?: string | null
          looking_for_rank_min?: string | null
          looking_for_rank_max?: string | null
          looking_for?: string | null
          is_admin?: boolean | null
          languages?: string[] | null
          playstyle?: string | null
          last_synced_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']> & { updated_at?: string }
        Relationships: []
      }
      valorant_stats: {
        Row: {
          id: string
          user_id: string
          wins: number
          losses: number
          kd_ratio: number
          headshot_rate: number
          avg_score: number
          matches_played: number
          playtime_hours: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wins?: number
          losses?: number
          kd_ratio?: number
          headshot_rate?: number
          avg_score?: number
          matches_played?: number
          playtime_hours?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wins?: number
          losses?: number
          kd_ratio?: number
          headshot_rate?: number
          avg_score?: number
          matches_played?: number
          playtime_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          direction: 'left' | 'right'
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          direction: 'left' | 'right'
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          direction?: 'left' | 'right'
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          read?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ValorantStats = Database['public']['Tables']['valorant_stats']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
