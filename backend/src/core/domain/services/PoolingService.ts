export interface PoolInput {
  ship_id: string;
  cb: number;
}

export class PoolingService {

  static createPool(members: PoolInput[]) {

    const total = members.reduce((sum, m) => sum + m.cb, 0);
    if (total < 0) throw new Error("Pool sum must be >= 0");

    const surplus = members.filter(m => m.cb > 0)
      .sort((a, b) => b.cb - a.cb);

    const deficit = members.filter(m => m.cb < 0)
      .sort((a, b) => a.cb - b.cb);

    for (const d of deficit) {
      let remaining = Math.abs(d.cb);

      for (const s of surplus) {
        if (s.cb <= 0) continue;

        const transfer = Math.min(s.cb, remaining);
        s.cb -= transfer;
        remaining -= transfer;

        if (remaining === 0) break;
      }

      if (remaining > 0)
        throw new Error("Not enough surplus to cover deficit");

      d.cb = 0;
    }

    return members.map(m => ({
      ship_id: m.ship_id,
      cb_after: m.cb
    }));
  }
}