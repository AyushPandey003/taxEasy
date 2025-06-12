
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageSquare, ThumbsUp, Eye, CheckCircle, ArrowLeft, Tag, User } from "lucide-react";
import MainLayout from "../../../components/shared/main-layout";
import QuestionActions from "./question-actions";
import AnswerForm from "./answer-form";
import RelatedQuestions from "./related-questions";
import ClientHandlers from "./client-handlers";

// Define the metadata for the page (SEO)
export async function generateMetadata({ params }: { params:Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return {
      title: "Question Not Found | TaxOp Community",
      description: "The requested question could not be found.",
    };
  }

  try {
    const question = await getQuestionData(id);
    
    return {
      title: `${question.title} | TaxOp Community`,
      description: question.content.substring(0, 160) + "...",
    };
  } catch {
    return {
      title: "Question | TaxOp Community",
      description: "View and answer tax questions from the community",
    };
  }
}

async function getQuestionData(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/community?type=post&id=${id}`, { 
      cache: 'no-store' // Don't cache to get fresh data each time
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch question');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const id = params.id;

  if (!id) {
    notFound(); // Render 404 if ID is missing
  }

  try {
    const question = await getQuestionData(id);
    
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link 
              href="/community" 
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Community
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {/* Question Header */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {question.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-between gap-y-4 mb-6">
                  <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span>{/*Views not returned by API*/}</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1.5" />
                      <span>{question.upvotes} likes</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      <span>{question.answers.length} answers</span>
                    </div>
                    <div>
                      <span>{question.createdAt}</span>
                    </div>
                  </div>
                </div>
                
                {/* Author */}
                <div className="flex items-center mb-6">
                  <div className="relative flex-shrink-0 mr-3">
                    {question.author.image ? (
                      <Image 
                        src={question.author.image} 
                        alt={question.author.name || "User"}
                        width={40} 
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      </div>
                    )}
                    {question.author.isVerified && (
                      <span className="absolute -bottom-1 -right-1 block bg-blue-500 rounded-full p-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {question.author.name || "Anonymous"}
                      {question.author.isTaxPro && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          Tax Pro
                        </span>
                      )}
                    </div>
                    {question.author.designation && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {question.author.designation}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Question Content */}
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: question.content }} />
                </div>
                
                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {question.tags.map((tag: string, index: number) => (
                      <Link 
                        key={index}
                        href={`/community/search?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Question Actions */}
              <QuestionActions questionId={question.id} likes={question.upvotes} />
              
              {/* Answers Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Answers ({question.answers.length})
                </h2>
                
                {question.answers.length > 0 ? (
                  <div className="space-y-6">
                    {question.answers.map((answer: { id: string; body: string; isAccepted: boolean; likes: number; createdAt: string; author: { name: string; image?: string; isVerified: boolean; isTaxPro: boolean } }) => (
                      <div 
                        key={answer.id}
                        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
                          answer.isAccepted 
                            ? 'border-green-200 dark:border-green-900' 
                            : 'border-slate-200 dark:border-slate-700'
                        } p-6`}
                      >
                        {/* Accepted Banner */}
                        {answer.isAccepted && (
                          <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-2 rounded-lg mb-4 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            This answer has been accepted by the question author
                          </div>
                        )}
                        
                        {/* Answer Content */}
                        <div className="prose dark:prose-invert max-w-none mb-4">
                          <div dangerouslySetInnerHTML={{ __html: answer.body }} />
                        </div>
                        
                        {/* Answer Author */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0 mr-3">
                              {answer.author.image ? (
                                <Image 
                                  src={answer.author.image} 
                                  alt={answer.author.name || "User"}
                                  width={32} 
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </div>
                              )}
                              {answer.author.isVerified && (
                                <span className="absolute -bottom-1 -right-1 block bg-blue-500 rounded-full p-0.5">
                                  <CheckCircle className="w-2 h-2 text-white" />
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white text-sm">
                                {answer.author.name || "Anonymous"}
                                {answer.author.isTaxPro && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                    Tax Pro
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {answer.createdAt}
                              </div>
                            </div>
                          </div>
                          
                          {/* Answer Actions */}
                          <div className="flex items-center space-x-4">
                            <button 
                              className="flex items-center text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                              data-answer-id={answer.id}
                              data-action="like"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              <span>{answer.likes}</span>
                            </button>
                            
                            {/* Accept Answer Button (only visible to question author) */}
                            {!answer.isAccepted && (
                              <button 
                                className="text-sm px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-200 hidden js-accept-answer"
                                data-answer-id={answer.id}
                                data-question-id={question.id}
                              >
                                <span className="flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accept
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No answers yet. Be the first to answer this question!</p>
                  </div>
                )}
              </div>
              
              {/* Answer Form */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Answer</h3>
                <AnswerForm questionId={question.id} />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Related Questions */}
                <RelatedQuestions currentQuestionId={question.id} tags={question.tags} />
                
                {/* Community Guidelines */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Community Guidelines</h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <li>• Be respectful and helpful</li>
                    <li>• Provide detailed answers</li>
                    <li>• Cite sources when relevant</li>
                    <li>• Upvote useful answers</li>
                    <li>• Flag inappropriate content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client-side handlers for interactivity */}
          <ClientHandlers questionId={question.id} />
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error in question page:', error);
    notFound();
  }
}
