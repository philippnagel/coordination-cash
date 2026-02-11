import { Share2 } from "lucide-react";
import type { ReactNode } from "react";

type Page = "calculator" | "methodology" | "data" | "about";

const NAV_ITEMS: { id: Page; label: string }[] = [
	{ id: "calculator", label: "Rechner" },
	{ id: "methodology", label: "Methodik" },
	{ id: "data", label: "Datenquellen" },
	{ id: "about", label: "Info" },
];

interface LayoutProps {
	currentPage: Page;
	onNavigate: (page: Page) => void;
	children: ReactNode;
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
	const handleShare = () => {
		navigator.clipboard.writeText(window.location.href);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
					<button
						type="button"
						onClick={() => onNavigate("calculator")}
						className="text-lg font-semibold text-gray-900 hover:text-blue-700 transition-colors"
					>
						coordination.cash
					</button>
					<nav className="hidden sm:flex items-center gap-1">
						{NAV_ITEMS.map((item) => (
							<button
								type="button"
								key={item.id}
								onClick={() => onNavigate(item.id)}
								className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
									currentPage === item.id
										? "bg-blue-50 text-blue-700"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
								}`}
							>
								{item.label}
							</button>
						))}
						<button
							type="button"
							onClick={handleShare}
							className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
							title="Link kopieren"
						>
							<Share2 size={16} />
						</button>
					</nav>
					{/* Mobile nav */}
					<div className="sm:hidden flex items-center gap-1">
						{NAV_ITEMS.map((item) => (
							<button
								type="button"
								key={item.id}
								onClick={() => onNavigate(item.id)}
								className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
									currentPage === item.id
										? "bg-blue-50 text-blue-700"
										: "text-gray-500"
								}`}
							>
								{item.label}
							</button>
						))}
					</div>
				</div>
			</header>
			<main className="flex-1 px-4 py-6">{children}</main>
			<footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
				edi@energy National Cost Model v0.2 — Alle Annahmen transparent und
				anpassbar
			</footer>
		</div>
	);
}
