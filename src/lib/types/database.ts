// Re-export generated database types
export type { Database } from '../database.types';
export type { Json } from '../database.types';
import type { Database } from '../database.types';

// Type aliases for convenience
export type MembershipRole = Database['public']['Enums']['membership_role'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type OrganizationMemberInsert = Database['public']['Tables']['organization_members']['Insert'];
export type OrganizationMemberUpdate = Database['public']['Tables']['organization_members']['Update'];

export type OrganizationInvite = Database['public']['Tables']['organization_invites']['Row'];
export type OrganizationInviteInsert = Database['public']['Tables']['organization_invites']['Insert'];
export type OrganizationInviteUpdate = Database['public']['Tables']['organization_invites']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// Extended types for joined data (common query patterns)
export interface OrganizationMemberWithProfile extends OrganizationMember {
  user_profiles?: UserProfile;
}

export interface OrganizationMemberWithOrganization extends OrganizationMember {
  organizations?: Organization;
}