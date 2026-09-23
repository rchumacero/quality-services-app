import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient | null = null;
  private adminClientInstance: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients(): void {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL', 'http://localhost:54321');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY', '');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');

    if (supabaseUrl && anonKey) {
      this.clientInstance = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
      });
      this.logger.log(`Initialized public Supabase client against ${supabaseUrl}`);
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_ANON_KEY is missing. Public Supabase client unavailable.');
    }

    if (supabaseUrl && serviceRoleKey) {
      this.adminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });
      this.logger.log('Initialized admin Supabase client with service role key');
    }
  }

  /**
   * Returns standard public Supabase client (respects RLS)
   */
  getClient(): SupabaseClient {
    if (!this.clientInstance) {
      throw new Error('Supabase public client is not configured.');
    }
    return this.clientInstance;
  }

  /**
   * Returns administrative Supabase client (service role)
   */
  getAdminClient(): SupabaseClient {
    if (!this.adminClientInstance) {
      throw new Error('Supabase admin client is not configured.');
    }
    return this.adminClientInstance;
  }

  /**
   * Validates a JWT token and returns user details
   */
  async validateUserToken(token: string): Promise<User | null> {
    if (!this.clientInstance) return null;
    try {
      const { data, error } = await this.clientInstance.auth.getUser(token);
      if (error || !data.user) {
        return null;
      }
      return data.user;
    } catch {
      return null;
    }
  }
}
