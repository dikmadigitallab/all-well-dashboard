export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      alertas: {
        Row: {
          colaborador_id: string | null;
          created_at: string;
          email_enviado: boolean;
          id: string;
          lido: boolean;
          mensagem: string;
          tipo: Database["public"]["Enums"]["alerta_tipo"];
        };
        Insert: {
          colaborador_id?: string | null;
          created_at?: string;
          email_enviado?: boolean;
          id?: string;
          lido?: boolean;
          mensagem: string;
          tipo: Database["public"]["Enums"]["alerta_tipo"];
        };
        Update: {
          colaborador_id?: string | null;
          created_at?: string;
          email_enviado?: boolean;
          id?: string;
          lido?: boolean;
          mensagem?: string;
          tipo?: Database["public"]["Enums"]["alerta_tipo"];
        };
        Relationships: [
          {
            foreignKeyName: "alertas_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      colaboradores: {
        Row: {
          area: string | null;
          ativo: boolean;
          cpf: string | null;
          created_at: string;
          created_by: string | null;
          dias_para_vencer: number | null;
          empresa: string | null;
          escala_turno: string | null;
          funcao: string | null;
          ghe: string | null;
          id: string;
          matricula_sap: string | null;
          nascimento: string | null;
          nome: string;
          observacoes: string | null;
          periodicidade_meses: number | null;
          pis: string | null;
          proximo_exame: string | null;
          rg: string | null;
          setor: string | null;
          status: Database["public"]["Enums"]["aso_status"];
          ultimo_exame: string | null;
          unidade: string | null;
          updated_at: string;
        };
        Insert: {
          area?: string | null;
          ativo?: boolean;
          cpf?: string | null;
          created_at?: string;
          created_by?: string | null;
          dias_para_vencer?: number | null;
          empresa?: string | null;
          escala_turno?: string | null;
          funcao?: string | null;
          ghe?: string | null;
          id?: string;
          matricula_sap?: string | null;
          nascimento?: string | null;
          nome: string;
          observacoes?: string | null;
          periodicidade_meses?: number | null;
          pis?: string | null;
          proximo_exame?: string | null;
          rg?: string | null;
          setor?: string | null;
          status?: Database["public"]["Enums"]["aso_status"];
          ultimo_exame?: string | null;
          unidade?: string | null;
          updated_at?: string;
        };
        Update: {
          area?: string | null;
          ativo?: boolean;
          cpf?: string | null;
          created_at?: string;
          created_by?: string | null;
          dias_para_vencer?: number | null;
          empresa?: string | null;
          escala_turno?: string | null;
          funcao?: string | null;
          ghe?: string | null;
          id?: string;
          matricula_sap?: string | null;
          nascimento?: string | null;
          nome?: string;
          observacoes?: string | null;
          periodicidade_meses?: number | null;
          pis?: string | null;
          proximo_exame?: string | null;
          rg?: string | null;
          setor?: string | null;
          status?: Database["public"]["Enums"]["aso_status"];
          ultimo_exame?: string | null;
          unidade?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exames: {
        Row: {
          arquivo_url: string | null;
          clinica: string | null;
          colaborador_id: string;
          created_at: string;
          created_by: string | null;
          data_agendada: string | null;
          data_realizado: string | null;
          data_vencimento: string | null;
          id: string;
          justificativa: string | null;
          medico: string | null;
          motivo_pendencia: Database["public"]["Enums"]["pendencia_motivo"] | null;
          status: Database["public"]["Enums"]["exame_status"];
          tipo: Database["public"]["Enums"]["exame_tipo"];
          updated_at: string;
        };
        Insert: {
          arquivo_url?: string | null;
          clinica?: string | null;
          colaborador_id: string;
          created_at?: string;
          created_by?: string | null;
          data_agendada?: string | null;
          data_realizado?: string | null;
          data_vencimento?: string | null;
          id?: string;
          justificativa?: string | null;
          medico?: string | null;
          motivo_pendencia?: Database["public"]["Enums"]["pendencia_motivo"] | null;
          status?: Database["public"]["Enums"]["exame_status"];
          tipo?: Database["public"]["Enums"]["exame_tipo"];
          updated_at?: string;
        };
        Update: {
          arquivo_url?: string | null;
          clinica?: string | null;
          colaborador_id?: string;
          created_at?: string;
          created_by?: string | null;
          data_agendada?: string | null;
          data_realizado?: string | null;
          data_vencimento?: string | null;
          id?: string;
          justificativa?: string | null;
          medico?: string | null;
          motivo_pendencia?: Database["public"]["Enums"]["pendencia_motivo"] | null;
          status?: Database["public"]["Enums"]["exame_status"];
          tipo?: Database["public"]["Enums"]["exame_tipo"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exames_colaborador_id_fkey";
            columns: ["colaborador_id"];
            isOneToOne: false;
            referencedRelation: "colaboradores";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      alerta_tipo:
        "aso_vencendo" | "aso_vencido" | "exame_pendente" | "falta_exame" | "reagendamento";
      app_role: "admin" | "gestor";
      aso_status: "em_dia" | "a_vencer" | "vencido" | "sem_exame";
      exame_status: "agendado" | "compareceu" | "faltou" | "pendente" | "cancelado" | "realizado";
      exame_tipo:
        | "admissional"
        | "periodico"
        | "demissional"
        | "retorno_ao_trabalho"
        | "mudanca_riscos"
        | "complementar";
      pendencia_motivo:
        "agendamento" | "falta_colaborador" | "documentacao" | "afastamento" | "recusa" | "outro";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      alerta_tipo: [
        "aso_vencendo",
        "aso_vencido",
        "exame_pendente",
        "falta_exame",
        "reagendamento",
      ],
      app_role: ["admin", "gestor"],
      aso_status: ["em_dia", "a_vencer", "vencido", "sem_exame"],
      exame_status: ["agendado", "compareceu", "faltou", "pendente", "cancelado", "realizado"],
      exame_tipo: [
        "admissional",
        "periodico",
        "demissional",
        "retorno_ao_trabalho",
        "mudanca_riscos",
        "complementar",
      ],
      pendencia_motivo: [
        "agendamento",
        "falta_colaborador",
        "documentacao",
        "afastamento",
        "recusa",
        "outro",
      ],
    },
  },
} as const;
