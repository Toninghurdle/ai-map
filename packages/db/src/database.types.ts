// Hand-written stand-in for the generated Supabase types.
//
// Regenerate the real thing once the project is linked, with:
//   supabase gen types typescript --linked > packages/db/src/database.types.ts
//
// Until then, this covers only the tables the MVP site reads (layers,
// subareas, nodes, orgs, edges, contributions), with the columns that exist
// in supabase/migrations/20260925000000_core_schema.sql. It is deliberately
// smaller than the full schema (actors, sources, change_proposals and so on
// are not modelled here) so the site can compile against it in the
// meantime; do not treat it as the schema's source of truth.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      layers: {
        Row: {
          id: string;
          slug: string;
          name: string;
          definition: string;
          role_line: string | null;
          sort_order: number;
          status: 'active' | 'retired';
          introduced_in: string | null;
          retired_in: string | null;
          created_by: string | null;
          created_at: string;
          created_method: string | null;
          updated_by: string | null;
          updated_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          verified_method: string | null;
          verification_state: 'unverified' | 'verified' | 'needs-recheck' | 'disputed';
          last_checked_at: string | null;
          row_version: number;
        };
        Insert: Partial<Database['public']['Tables']['layers']['Row']> &
          Pick<Database['public']['Tables']['layers']['Row'], 'slug' | 'name' | 'definition'>;
        Update: Partial<Database['public']['Tables']['layers']['Row']>;
      };

      subareas: {
        Row: {
          id: string;
          slug: string;
          layer_id: string;
          name: string;
          definition: string;
          scope_rule: string | null;
          sort_order: number;
          status: 'active' | 'retired';
          introduced_in: string | null;
          retired_in: string | null;
          created_by: string | null;
          created_at: string;
          created_method: string | null;
          updated_by: string | null;
          updated_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          verified_method: string | null;
          verification_state: 'unverified' | 'verified' | 'needs-recheck' | 'disputed';
          last_checked_at: string | null;
          row_version: number;
        };
        Insert: Partial<Database['public']['Tables']['subareas']['Row']> &
          Pick<Database['public']['Tables']['subareas']['Row'], 'slug' | 'layer_id' | 'name' | 'definition'>;
        Update: Partial<Database['public']['Tables']['subareas']['Row']>;
      };

      nodes: {
        Row: {
          id: string;
          slug: string;
          subarea_id: string;
          name: string;
          definition: string;
          why_it_matters: string | null;
          progress_looks_like: string | null;
          canonical_reference: Json | null;
          key_agendas: Json | null;
          boundary_notes: string | null;
          tailwind_links: string[];
          capacity: 'none' | 'thin' | 'active' | 'busy';
          capacity_note: string | null;
          home: string[];
          owner_field: string | null;
          connection: 'not-applicable' | 'strong' | 'weak' | 'missing';
          connection_note: string | null;
          lenses: string[];
          existing_mitigations: string | null;
          confidence: 'low' | 'medium' | 'high' | null;
          reference_needs_replacing: boolean;
          open_problems_source: Json | null;
          entry_points: string | null;
          legacy_batch: string | null;
          sort_order: number;
          status: 'active' | 'retired';
          introduced_in: string | null;
          retired_in: string | null;
          created_by: string | null;
          created_at: string;
          created_method: string | null;
          updated_by: string | null;
          updated_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          verified_method: string | null;
          verification_state: 'unverified' | 'verified' | 'needs-recheck' | 'disputed';
          last_checked_at: string | null;
          row_version: number;
        };
        Insert: Partial<Database['public']['Tables']['nodes']['Row']> &
          Pick<Database['public']['Tables']['nodes']['Row'], 'slug' | 'subarea_id' | 'name' | 'definition' | 'capacity'>;
        Update: Partial<Database['public']['Tables']['nodes']['Row']>;
      };

      orgs: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          url: string | null;
          type: string | null;
          parent_org_id: string | null;
          hq_country: string | null;
          hq_city: string | null;
          region: string | null;
          founded_year: number | null;
          size_band: string | null;
          funding_model: string | null;
          commercial_model: string | null;
          primary_focus: string | null;
          focus_tags: string[];
          problem_description: string | null;
          notable_outputs: string | null;
          status: 'active' | 'dormant' | 'closed' | 'unknown';
          confidence: 'low' | 'medium' | 'high' | null;
          approachability: string[];
          record_origin: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          created_method: string | null;
          updated_by: string | null;
          updated_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          verified_method: string | null;
          verification_state: 'unverified' | 'verified' | 'needs-recheck' | 'disputed';
          last_checked_at: string | null;
          row_version: number;
        };
        Insert: Partial<Database['public']['Tables']['orgs']['Row']> &
          Pick<Database['public']['Tables']['orgs']['Row'], 'org_id' | 'name'>;
        Update: Partial<Database['public']['Tables']['orgs']['Row']>;
      };

      edges: {
        Row: {
          id: string;
          org_id: string | null;
          product_id: string | null;
          node_id: string;
          role: 'primary' | 'secondary';
          evidence_source_id: string | null;
          evidence_url: string;
          evidence_note: string | null;
          evidence_strength: 'strong' | 'moderate' | 'weak' | 'unrated';
          status: 'current' | 'historical';
          legacy_batch: string | null;
          created_by: string | null;
          created_at: string;
          created_method: string | null;
          updated_by: string | null;
          updated_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          verified_method: string | null;
          verification_state: 'unverified' | 'verified' | 'needs-recheck' | 'disputed';
          last_checked_at: string | null;
          row_version: number;
        };
        Insert: Partial<Database['public']['Tables']['edges']['Row']> &
          Pick<Database['public']['Tables']['edges']['Row'], 'node_id' | 'role' | 'evidence_url'>;
        Update: Partial<Database['public']['Tables']['edges']['Row']>;
      };

      contributions: {
        Row: {
          id: string;
          target_table: string | null;
          target_id: string | null;
          kind:
            | 'incorrect'
            | 'missing-org'
            | 'missing-product'
            | 'missing-evidence'
            | 'outdated'
            | 'wrong-tag'
            | 'other';
          field: string | null;
          suggested_value: string | null;
          evidence_url: string | null;
          body: string | null;
          contact_email: string | null;
          contact_handle: string | null;
          confirmed_at: string | null;
          domain_matched_org_id: string | null;
          author_id: string | null;
          author_snapshot: Json | null;
          is_self_report: boolean;
          credit_opt_in: boolean;
          status: 'submitted' | 'triaged' | 'converted' | 'accepted' | 'declined' | 'spam';
          proposal_id: string | null;
          handled_by: string | null;
          handled_at: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        // Rows are written only through public.submit_contribution(); there is
        // deliberately no direct Insert type for the anon path here.
        Insert: never;
        Update: Partial<Pick<Database['public']['Tables']['contributions']['Row'], 'status' | 'handled_by' | 'handled_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      map_json: {
        Args: Record<string, never>;
        Returns: Json;
      };
      submit_contribution: {
        Args: {
          p_target_table: string | null;
          p_target_id: string | null;
          p_kind: string;
          p_field: string | null;
          p_suggested_value: string | null;
          p_evidence_url: string | null;
          p_body: string | null;
          p_contact_email: string | null;
          p_contact_handle: string | null;
          p_credit_opt_in: boolean | null;
          p_ip_hash: string | null;
        };
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
