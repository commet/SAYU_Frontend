'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChatbotErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Chatbot error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <motion.div 
          className="flex flex-col items-center justify-center p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 mb-4 text-red-500">
            <AlertCircle className="w-full h-full" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            앗! 문제가 발생했어요
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
            AI 큐레이터와 연결하는 중 문제가 발생했습니다. 
            잠시 후 다시 시도해주세요.
          </p>
          
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// 사용자 친화적 에러 메시지 매핑
export const getErrorMessage = (error: string | Error): string => {
  const errorStr = typeof error === 'string' ? error : error.message;
  
  const errorMessages: Record<string, string> = {
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요.',
    'TIMEOUT': '응답 시간이 초과되었습니다. 다시 시도해주세요.',
    'INVALID_MESSAGE': '메시지를 입력해주세요.',
    'TOO_LONG': '메시지가 너무 깁니다. 짧게 작성해주세요.',
    'BLOCKED_TOPIC': '예술과 관련된 주제로 대화해주세요.',
    'SESSION_EXPIRED': '대화 세션이 만료되었습니다. 새로 시작해주세요.',
    'SERVICE_UNAVAILABLE': 'AI 서비스가 일시적으로 중단되었습니다.',
    'RATE_LIMIT': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  };
  
  // 에러 문자열에서 매칭되는 키 찾기
  for (const [key, message] of Object.entries(errorMessages)) {
    if (errorStr.includes(key)) {
      return message;
    }
  }
  
  // 기본 메시지
  return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};