import {
  createPingCommand,
  commandToJson,
  getPingJsonString,
  isJMRICommand,
  JMRICommandBase
} from '../JMRICommands';

describe('JMRI Commands', () => {
  describe('createPingCommand', () => {
    it('should create a ping command with the correct format', () => {
      const command = createPingCommand();
      expect(command.type).toBe('ping');
      expect(command.data).toBeUndefined();
    });
  });

  describe('commandToJson', () => {
    it('should convert a command to JSON string', () => {
      const command: JMRICommandBase = {
        type: 'test',
        data: { key: 'value' }
      };
      const json = commandToJson(command);
      expect(json).toBe('{"type":"test","data":{"key":"value"}}');
    });
  });

  describe('getPingJsonString', () => {
    it('should return a JSON string for a ping command', () => {
      const json = getPingJsonString();
      const expected = '{"type":"ping"}';
      expect(json).toBe(expected);
    });
  });

  describe('isJMRICommand', () => {
    it('should return true for valid JMRI commands', () => {
      const validCommand = {
        type: 'test',
        data: { someData: true }
      };
      expect(isJMRICommand(validCommand)).toBe(true);
      
      // Ping command with just type field
      const pingCommand = {
        type: 'ping'
      };
      expect(isJMRICommand(pingCommand)).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isJMRICommand(null)).toBe(false);
      expect(isJMRICommand(undefined)).toBe(false);
      expect(isJMRICommand('string')).toBe(false);
      expect(isJMRICommand(123)).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(isJMRICommand({})).toBe(false);
      expect(isJMRICommand({ data: {} })).toBe(false);
      expect(isJMRICommand({ type: 123 })).toBe(false);
    });
  });
}); 