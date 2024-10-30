import { auth } from '../../../auth';
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getUserById } from '@/data/user';

export async function GET(request: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ message: 'You are not logged in.' }, { status: 401 });
	}
	const userId = session.user?.id;
	if (!userId) {
		return NextResponse.json({ message: 'User ID is missing.' }, { status: 400 });
	}

	try {
		const watchlist = await prisma.watchlist.findUnique({
			where: { userId: userId },
			include: {
				coins: {
					include: {
						coin: true
					}
				}
			}
		});

		if (!watchlist) {
			return NextResponse.json({ message: 'You have no watchlist.' }, { status: 404 });
		}

		const coins = watchlist.coins.map((coin) => coin.coin?.CoinId);
		return NextResponse.json(coins);
	} catch (error) {
		console.error('Error fetching watchlist:', error);
		return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ message: 'You are not logged in.' }, { status: 401 });
	}

	const userId = session.user?.id;
	if (!userId) return NextResponse.json({ message: 'User ID is missing.' }, { status: 400 });

	try {
		const user = await getUserById(userId);

		if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

		let watchlist = await prisma.watchlist.findUnique({
			where: { userId: userId }
		});

		if (!watchlist) {
			watchlist = await prisma.watchlist.create({
				data: {
					user: {
						connect: { UserId: userId }
					},
					coins: { create: [] }
				}
			});
		}

		const body = await request.json();
		const coinId = body.coinId;

		if (!coinId) return NextResponse.json({ message: 'No coinId provided.' }, { status: 400 });

		let coin = await prisma.coin.findUnique({
			where: { CoinId: coinId }
		});

		if (!coin) {
			coin = await prisma.coin.create({
				data: { CoinId: coinId }
			});
		}

		const existingWatchlistCoin = await prisma.watchlistCoin.findUnique({
			where: {
				watchlistId_coinId: {
					watchlistId: watchlist.id,
					coinId: coin.CoinId
				}
			}
		});

		if (existingWatchlistCoin) {
			return NextResponse.json({ message: 'Coin is already in the watchlist.' }, { status: 400 });
		}

		await prisma.watchlistCoin.create({
			data: {
				watchlistId: watchlist.id,
				coinId: coin.CoinId
			}
		});

		return NextResponse.json({ message: 'Coin added to watchlist.' });
	} catch (error) {
		console.error('Error adding coin to watchlist:', error);
		return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ message: 'You are not logged in.' }, { status: 401 });
	}

	const userId = session.user?.id;
	if (!userId) {
		return NextResponse.json({ message: 'User ID is missing.' }, { status: 400 });
	}

	try {
		const watchlist = await prisma.watchlist.findUnique({
			where: { userId: userId }
		});

		if (!watchlist) {
			return NextResponse.json({ message: 'You have no watchlist.' }, { status: 404 });
		}

		const body = await request.json();
		const coinId = body.coinId;

		if (!coinId) {
			return NextResponse.json({ message: 'No coinId provided.' }, { status: 400 });
		}

		const coin = await prisma.coin.findUnique({
			where: { CoinId: coinId }
		});

		if (!coin) {
			return NextResponse.json({ message: 'Coin not found.' }, { status: 404 });
		}

		await prisma.watchlistCoin.delete({
			where: {
				watchlistId_coinId: {
					watchlistId: watchlist.id,
					coinId: coin.CoinId
				}
			}
		});

		return NextResponse.json({ message: 'Coin removed from watchlist.' });
	} catch (error) {
		console.error('Error removing coin from watchlist:', error);
		return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
	}
}
