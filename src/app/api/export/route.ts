import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as xlsx from 'xlsx'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });

    const dataRows = bookings.map(b => ({
      Booking_ID: b.id,
      Property_Name: b.property.name,
      Property_Type: b.property.type === 'OWNED' ? 'Owned' : 'Commission',
      Customer_Name: b.customerName,
      Customer_Phone: b.customerPhone || 'N/A',
      Check_In: b.checkInDate.toISOString().split('T')[0],
      Check_Out: b.checkOutDate.toISOString().split('T')[0],
      Source: b.source,
      Total_Amount: b.totalAmount,
      Commission_Owed: b.commissionOwed || 0,
      Net_Revenue: b.totalAmount - (b.commissionOwed || 0)
    }));

    const worksheet = xlsx.utils.json_to_sheet(dataRows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="airbnb-business-data.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}
