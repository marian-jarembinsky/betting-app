/**
 * User-related interfaces for authentication and user management
 */

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  rawToken?: string;
}
