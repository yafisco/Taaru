export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      abonnements: {
        Row: { atelier_id: string; cree_le: string; cree_par: string | null; fin: string; id: string; mois: number; montant: number }
        Insert: { atelier_id: string; cree_le?: string; cree_par?: string | null; fin: string; id?: string; mois: number; montant: number }
        Update: { atelier_id?: string; cree_le?: string; cree_par?: string | null; fin?: string; id?: string; mois?: number; montant?: number }
        Relationships: [
          { foreignKeyName: "abonnements_atelier_id_fkey"; columns: ["atelier_id"]; isOneToOne: false; referencedRelation: "ateliers"; referencedColumns: ["id"] },
        ]
      }
      admins: {
        Row: { user_id: string }
        Insert: { user_id: string }
        Update: { user_id?: string }
        Relationships: []
      }
      ateliers: {
        Row: {
          capacite_semaine: number
          created_at: string
          fete_date: string | null
          fete_nom: string | null
          id: string
          langue_messages: string
          nom: string
          pro_jusqu_au: string | null
          telephone: string
          ville: string | null
        }
        Insert: {
          capacite_semaine?: number
          created_at?: string
          fete_date?: string | null
          fete_nom?: string | null
          id: string
          langue_messages?: string
          nom: string
          pro_jusqu_au?: string | null
          telephone: string
          ville?: string | null
        }
        Update: {
          capacite_semaine?: number
          created_at?: string
          fete_date?: string | null
          fete_nom?: string | null
          id?: string
          langue_messages?: string
          nom?: string
          pro_jusqu_au?: string | null
          telephone?: string
          ville?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          atelier_id: string
          created_at: string
          genre: string | null
          id: string
          nom: string
          notes: string | null
          quartier: string | null
          telephone: string | null
        }
        Insert: {
          atelier_id?: string
          created_at?: string
          genre?: string | null
          id?: string
          nom: string
          notes?: string | null
          quartier?: string | null
          telephone?: string | null
        }
        Update: {
          atelier_id?: string
          created_at?: string
          genre?: string | null
          id?: string
          nom?: string
          notes?: string | null
          quartier?: string | null
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers"
            referencedColumns: ["id"]
          },
        ]
      }
      commandes: {
        Row: {
          atelier_id: string
          client_id: string
          code: string
          created_at: string
          date_depot: string
          date_livraison: string | null
          description: string | null
          evenement: string | null
          id: string
          livre_le: string | null
          modele: string
          photo_modele_path: string | null
          photo_tissu_path: string | null
          pret_le: string | null
          prix_total: number
          statut: Database["public"]["Enums"]["statut_commande"]
          updated_at: string
        }
        Insert: {
          atelier_id?: string
          client_id: string
          code?: string
          created_at?: string
          date_depot?: string
          date_livraison?: string | null
          description?: string | null
          evenement?: string | null
          id?: string
          livre_le?: string | null
          modele: string
          photo_modele_path?: string | null
          photo_tissu_path?: string | null
          pret_le?: string | null
          prix_total: number
          statut?: Database["public"]["Enums"]["statut_commande"]
          updated_at?: string
        }
        Update: {
          atelier_id?: string
          client_id?: string
          code?: string
          created_at?: string
          date_depot?: string
          date_livraison?: string | null
          description?: string | null
          evenement?: string | null
          id?: string
          livre_le?: string | null
          modele?: string
          photo_modele_path?: string | null
          photo_tissu_path?: string | null
          pret_le?: string | null
          prix_total?: number
          statut?: Database["public"]["Enums"]["statut_commande"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commandes_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      mesures: {
        Row: {
          atelier_id: string
          client_id: string
          remarques: string | null
          updated_at: string
          valeurs: Json
        }
        Insert: {
          atelier_id?: string
          client_id: string
          remarques?: string | null
          updated_at?: string
          valeurs?: Json
        }
        Update: {
          atelier_id?: string
          client_id?: string
          remarques?: string | null
          updated_at?: string
          valeurs?: Json
        }
        Relationships: [
          {
            foreignKeyName: "mesures_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          atelier_id: string
          commande_id: string
          id: string
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          note: string | null
          paye_le: string
        }
        Insert: {
          atelier_id?: string
          commande_id: string
          id?: string
          mode?: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          note?: string | null
          paye_le?: string
        }
        Update: {
          atelier_id?: string
          commande_id?: string
          id?: string
          mode?: Database["public"]["Enums"]["mode_paiement"]
          montant?: number
          note?: string | null
          paye_le?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "v_commandes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_commandes: {
        Row: {
          atelier_id: string | null
          client_id: string | null
          client_nom: string | null
          client_telephone: string | null
          code: string | null
          created_at: string | null
          date_depot: string | null
          date_livraison: string | null
          description: string | null
          en_retard: boolean | null
          evenement: string | null
          id: string | null
          livre_le: string | null
          modele: string | null
          photo_modele_path: string | null
          photo_tissu_path: string | null
          pret_le: string | null
          prix_total: number | null
          reste: number | null
          statut: Database["public"]["Enums"]["statut_commande"] | null
          total_paye: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commandes_atelier_id_fkey"
            columns: ["atelier_id"]
            isOneToOne: false
            referencedRelation: "ateliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_ateliers: {
        Args: never
        Returns: {
          commandes_en_cours: number
          commandes_total: number
          created_at: string
          id: string
          nom: string
          pro_jusqu_au: string | null
          telephone: string
          total_paye: number
          ville: string | null
        }[]
      }
      admin_prolonger_pro: { Args: { p_atelier: string; p_mois: number; p_montant: number }; Returns: string }
      admin_retirer_pro: { Args: { p_atelier: string }; Returns: undefined }
      contact_taaru: { Args: never; Returns: string | null }
      est_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      mode_paiement: "especes" | "wave" | "orange_money" | "autre"
      statut_commande:
        | "recue"
        | "coupe"
        | "couture"
        | "prete"
        | "livree"
        | "annulee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mode_paiement: ["especes", "wave", "orange_money", "autre"],
      statut_commande: [
        "recue",
        "coupe",
        "couture",
        "prete",
        "livree",
        "annulee",
      ],
    },
  },
} as const
