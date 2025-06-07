'use client';
import * as Select from '@radix-ui/react-select';
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useEffect, useState, Fragment } from 'react';
import { getQuestionList } from '../../../actions/questionBank';

// Define categories on the frontend
const CATEGORIES = [
    'Product Strategy',
    'Execution',
    'Analytics & Metrics',
    'Product Design',
    'Behavioral',
    'Guesstimate',
    'Market Entry',
    'Product Improvement',
];

// Badge color helpers
const badgeColors = {
    'Product Design': 'bg-pink-100 text-pink-700',
    'Guesstimate': 'bg-purple-100 text-purple-700',
    'Market Entry': 'bg-blue-100 text-blue-700',
    'Product Improvement': 'bg-sky-100 text-sky-700',
    'Product Strategy': 'bg-indigo-100 text-indigo-700',
    'Execution': 'bg-green-100 text-green-700',
    'Analytics & Metrics': 'bg-orange-100 text-orange-700',
    'Behavioral': 'bg-pink-100 text-pink-700'
};

const companyColors = {
    'Netflix': 'bg-pink-50 text-pink-700',
    'Flipkart': 'bg-yellow-50 text-yellow-700',
    'Whatsapp': 'bg-green-50 text-green-700',
    'Swiggy': 'bg-yellow-50 text-yellow-700',
    'Slack': 'bg-lime-100 text-lime-700',
    'General': 'bg-green-100 text-green-700',
    'PayPal': 'bg-blue-100 text-blue-700'
};

export default function QuestionListPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        async function fetchQuestions() {
            setLoading(true);
            setError(null);
            const result = await getQuestionList();
            if (result.status === 'error') {
                setError(result.message || 'Failed to fetch questions.');
                setQuestions([]);
            } else {
                setQuestions(result.questions || []);
            }
            setLoading(false);
        }
        fetchQuestions();
    }, []);

    // Filter questions by selected category and search
    const filteredQuestions = questions
        .filter(q =>
            selectedCategory === 'all' ? true : q.category === selectedCategory
        )
        .filter(q =>
            search.trim() === ''
                ? true
                : (q.question || q.title || '').toLowerCase().includes(search.trim().toLowerCase())
        );

    // Pagination logic
    const pageCount = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const paginatedQuestions = filteredQuestions.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // Reset to page 1 if filter/search changes and current page is out of range
    useEffect(() => {
        if (page > pageCount) setPage(1);
    }, [filteredQuestions.length, pageCount]);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 flex justify-center">
            <div className="w-full max-w-5xl py-10">
                <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-900">Question Library</h1>
                <p className="text-center text-gray-500 mb-8">
                    Browse and search through our collection of product management interview questions
                </p>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition bg-gray-50"
                            placeholder="Search questions..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
                        <Select.Trigger
                            className="inline-flex items-center justify-between rounded-lg px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-200 transition"
                            aria-label="Question Category"
                        >
                            <Select.Value placeholder="Question Category" />
                            <Select.Icon>
                                <ChevronDownIcon />
                            </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content
                                className="bg-white rounded-xl shadow-xl border border-gray-100 mt-2 min-w-[220px] z-[100]"
                                sideOffset={5}
                            >
                                <Select.Viewport>
                                    <Select.Item
                                        value="all"
                                        className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer rounded-t-xl text-gray-700 font-medium focus:bg-blue-100 focus:outline-none"
                                    >
                                        <Select.ItemText>All Categories</Select.ItemText>
                                        <Select.ItemIndicator className="ml-auto">
                                            <CheckIcon />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                    {CATEGORIES.map(cat => (
                                        <Select.Item
                                            key={cat}
                                            value={cat}
                                            className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 focus:bg-blue-100 focus:outline-none"
                                        >
                                            <Select.ItemText>{cat}</Select.ItemText>
                                            <Select.ItemIndicator className="ml-auto">
                                                <CheckIcon />
                                            </Select.ItemIndicator>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                </div>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[200px] flex flex-col justify-center items-center">
                    {loading ? (
                        <div className="py-12 text-gray-400 text-lg font-medium">Loading questions...</div>
                    ) : error ? (
                        <div className="py-12 text-red-500 text-lg font-medium">Error: {error}</div>
                    ) : paginatedQuestions.length === 0 ? (
                        <div className="py-12 text-gray-400 text-lg font-medium">No questions available.</div>
                    ) : (
                        <>
                        <div className="divide-y divide-gray-100 w-full">
                            <div className="grid grid-cols-[120px_110px_1fr_70px] px-6 py-4 bg-gray-50 font-semibold text-gray-600 text-base sticky top-0 z-10">
                                <div>Category</div>
                                <div>Company</div>
                                <div>Title</div>
                                <div className="text-center">Start Interview</div>
                            </div>
                            {paginatedQuestions.map((q, i) => (
                                <Fragment key={q.id}>
                                    <div
                                        className="grid grid-cols-[120px_110px_1fr_70px] px-6 py-4 items-center hover:bg-blue-50 transition group"
                                    >
                                        {/* Category Badge */}
                                        <div>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeColors[q.category] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {q.category}
                                            </span>
                                        </div>
                                        {/* Company Badge */}
                                        <div>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${companyColors[q.company] || 'bg-yellow-50 text-yellow-700'}`}
                                            >
                                                {q.company || <span className="opacity-50">—</span>}
                                            </span>
                                        </div>
                                        {/* Title */}
                                        <div className="font-medium text-gray-900 break-words">
                                            {(ITEMS_PER_PAGE * (page - 1)) + i + 1}. {q.question || q.title}
                                        </div>
                                        {/* Start Interview */}
                                        <div className="flex justify-center">
                                            <button
                                                className="bg-gray-900 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition group-hover:scale-105"
                                                aria-label="Start Interview"
                                            >
                                                <PlayIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                        {/* Pagination */}
                        {pageCount > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 mb-2">
                                <button
                                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeftIcon />
                                </button>
                                {Array.from({ length: pageCount }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition ${
                                            page === idx + 1
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pageCount}
                                    aria-label="Next Page"
                                >
                                    <ChevronRightIcon />
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}