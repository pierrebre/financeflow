import FormProfil from '@/src/components/dashboard/formProfil';
import Portfolio from '@/src/components/dashboard/portfolio/portfolio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';

export default function Dashboard() {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Tabs defaultValue="profil" className="">
				<TabsList className="">
					<TabsTrigger value="profil">Profil</TabsTrigger>
					<TabsTrigger value="portfolio">Portfolio</TabsTrigger>
				</TabsList>
				<TabsContent value="profil">
					<FormProfil />
				</TabsContent>
				<TabsContent value="portfolio">
					<Portfolio />
				</TabsContent>
			</Tabs>
		</div>
	);
}
