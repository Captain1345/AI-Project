'use client';
import * as Select from '@radix-ui/react-select';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const questions = [
	{
		id: 1,
		title: 'Slack enterprise messages daily',
		category: 'Estimation',
		company: 'Slack',
		status: 'unlocked',
	},
	{
		id: 2,
		title: 'Learn new skills quickly',
		category: 'Behavioral',
		company: 'General',
		status: 'unlocked',
	},
	{
		id: 3,
		title: 'PayPal daily transaction count',
		category: 'Estimation',
		company: 'PayPal',
		status: 'pro',
	},
	{
		id: 4,
		title: 'Innovate Amazon personalized shopping',
		category: 'Product Strategy',
		company: 'Amazon',
		status: 'unlocked',
	},
];

export default function QuestionListPage() {
	return (
		<div className="h-full bg-gray-100 px-8 py-8 w-full">
			<div className="w-full">
				<h1 className="text-3xl font-bold text-center mb-2">Question Library</h1>
				<p className="text-center text-gray-500 mb-8">
					Browse and search through our collection of product management interview questions
				</p>
				<div className="bg-white rounded-2xl shadow p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
					<div className="relative flex-1 w-full">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
							placeholder="Search questions..."
						/>
					</div>
					<Select.Root>
						<Select.Trigger className="inline-flex items-center justify-between rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-200">
							<Select.Value placeholder="Question Category" />
							<Select.Icon />
						</Select.Trigger>
						<Select.Portal>
							<Select.Content
								className="bg-white rounded-xl shadow-xl border border-gray-100 mt-2 min-w-[220px] z-50"
								sideOffset={5}
							>
								<Select.Viewport>
									<Select.Item value="all" className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-t-xl text-gray-700 font-medium">
										All Categories
									</Select.Item>
									<Select.Item value="Product Strategy" className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
										Product Strategy
									</Select.Item>
									<Select.Item value="Execution" className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
										Execution
									</Select.Item>
									<Select.Item value="Analytics & Metrics" className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
										Analytics & Metrics
									</Select.Item>
									<Select.Item value="Product Design" className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
										Product Design
									</Select.Item>
									<Select.Item value="Estimation" className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
										Estimation
									</Select.Item>
									<Select.Item value="Behavioral" className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-b-xl text-gray-700">
										Behavioral
									</Select.Item>
								</Select.Viewport>
							</Select.Content>
						</Select.Portal>
					</Select.Root>
				</div>
				<div className="bg-white rounded-2xl shadow overflow-x-visible">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-gray-500 border-b">
								<th className="py-3 px-4 text-left font-semibold">Status</th>
								<th className="py-3 px-4 text-left font-semibold">Title</th>
								<th className="py-3 px-4 text-left font-semibold">Category</th>
								<th className="py-3 px-4 text-left font-semibold">Company</th>
								<th className="py-3 px-4 text-left font-semibold">Last Attempt</th>
								<th className="py-3 px-4 text-left font-semibold">Start Interview</th>
							</tr>
						</thead>
						<tbody>
							{questions.map((q, i) => (
								<tr key={q.id} className="border-b last:border-0">
									<td className="py-3 px-4">
										{q.status === 'pro' ? (
											<span className="inline-flex items-center gap-1 text-gray-400">
												<span className="material-icons text-base align-middle">lock</span>
												<span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded ml-1">Pro</span>
											</span>
										) : (
											<span className="text-green-500 font-bold">●</span>
										)}
									</td>
									<td className={`py-3 px-4 ${q.status === 'pro' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
										{i + 1}. {q.title}
									</td>
									<td className="py-3 px-4">
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
												q.category === 'Estimation'
													? 'bg-purple-100 text-purple-700'
													: q.category === 'Behavioral'
													? 'bg-pink-100 text-pink-700'
													: 'bg-blue-100 text-blue-700'
											}`}
										>
											{q.category}
										</span>
									</td>
									<td className="py-3 px-4">
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
												q.company === 'Slack'
													? 'bg-lime-100 text-lime-700'
													: q.company === 'General'
													? 'bg-green-100 text-green-700'
													: q.company === 'PayPal'
													? 'bg-blue-100 text-blue-700'
													: 'bg-yellow-100 text-yellow-700'
											}`}
										>
											{q.company}
										</span>
									</td>
									<td className="py-3 px-4 text-gray-400">—</td>
									<td className="py-3 px-4">
										{q.status === 'pro' ? (
											<button className="bg-gray-200 text-gray-500 px-3 py-1 rounded font-semibold cursor-not-allowed">
												Upgrade
											</button>
										) : (
											<button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-full shadow transition">
												<span className="material-icons align-middle text-base">play_arrow</span>
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{/* Pagination */}
				<div className="flex justify-center items-center gap-6 mt-8 pb-2">
					<button
						className="px-6 py-2 rounded-full bg-gray-100 text-gray-400 font-medium shadow-sm cursor-not-allowed"
						disabled
					>
						Previous
					</button>
					<span className="text-gray-600 font-medium">
						Page <span className="font-bold">1</span> of <span className="font-bold">42</span>
					</span>
					<button
						className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 font-medium shadow-sm hover:bg-gray-200 transition"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}