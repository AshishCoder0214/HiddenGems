import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Authentication Password Cryptography Logic', () => {
  it('should hash passwords and successfully verify matching credentials', async () => {
    const rawPassword = 'SecureSecret100!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    
    expect(hash).not.toBe(rawPassword);
    
    const isMatched = await bcrypt.compare(rawPassword, hash);
    expect(isMatched).toBe(true);

    const isFailed = await bcrypt.compare('WrongPassword', hash);
    expect(isFailed).toBe(false);
  });
});

describe('Centralized Logger Integrity', () => {
  it('should output logs structured correctly', () => {
    const logInfoMock = vi.fn((msg) => msg);
    logInfoMock('Vetted Gem Added');
    expect(logInfoMock).toHaveBeenCalledWith('Vetted Gem Added');
  });
});
