export class Utils {
  static async sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  static isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  static sanitizeName(name: string): string {
    return name.toLowerCase().replace(/\s|\+|#|\//g, '_');
  }

  static parseValue(value: any): any {
    if (typeof value === 'boolean') {
      return value;
    } else if (value === 'true' || value === 'false') {
      return value === 'true';
    } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return Number(value);
    } else {
      return value;
    }
  }

  static validateRange(value: number, min?: number, max?: number): number {
    if (min !== undefined && value < min) {
      return min;
    }
    if (max !== undefined && value > max) {
      return max;
    }
    return value;
  }
}
