// src/app/api/auth/sales/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Ambil Secret Key dari .env
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-rahasia-anda';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Cari user (di tabel SalesDealer)
    const user = await prisma.salesDealer.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Username tidak ditemukan' }, { status: 404 });
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    // 3. Buat JSON Web Token (JWT)
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        namaSales: user.nama_sales,
        type: 'SALES', // Pembeda
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 4. Kirim token ke client
    return NextResponse.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        namaSales: user.nama_sales,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
