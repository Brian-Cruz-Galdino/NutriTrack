import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Encerrar/Editar um jejum (PUT)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    const jejumAtualizado = await prisma.fasting.update({
      where: { id: resolvedParams.id },
      data: {
        endTime: body.endTime ? new Date(body.endTime) : null,
        status: body.status,
      },
    });
    return NextResponse.json(jejumAtualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao encerrar jejum' }, { status: 500 });
  }
}