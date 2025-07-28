'use client';

import { collectedComponents, getComponentsByStatus } from '@/components/collected-components';
import { useState } from 'react';

export default function TestComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'collected' | 'customized' | 'integrated'>('all');

  const filteredComponents = statusFilter === 'all' 
    ? collectedComponents 
    : getComponentsByStatus(statusFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">수집된 UI 컴포넌트 테스트</h1>
        
        {/* 필터 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            전체 ({Object.keys(collectedComponents).length})
          </button>
          <button
            onClick={() => setStatusFilter('collected')}
            className={`px-4 py-2 rounded ${statusFilter === 'collected' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            수집됨
          </button>
          <button
            onClick={() => setStatusFilter('customized')}
            className={`px-4 py-2 rounded ${statusFilter === 'customized' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          >
            커스터마이징됨
          </button>
          <button
            onClick={() => setStatusFilter('integrated')}
            className={`px-4 py-2 rounded ${statusFilter === 'integrated' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            통합됨
          </button>
        </div>

        {/* 컴포넌트 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 사이드바 - 컴포넌트 목록 */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">컴포넌트 목록</h2>
            {Object.keys(filteredComponents).length === 0 ? (
              <p className="text-gray-500">아직 수집된 컴포넌트가 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(filteredComponents).map(([key, component]) => (
                  <li
                    key={key}
                    onClick={() => setSelectedComponent(key)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedComponent === key 
                        ? 'bg-blue-100 border-blue-300 border' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-gray-500">{component.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 메인 영역 - 컴포넌트 상세 & 미리보기 */}
          <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-md">
            {selectedComponent && filteredComponents[selectedComponent] ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {filteredComponents[selectedComponent].name}
                </h2>
                
                <div className="mb-6 space-y-2">
                  <p><strong>경로:</strong> {filteredComponents[selectedComponent].path}</p>
                  <p><strong>상태:</strong> {filteredComponents[selectedComponent].status}</p>
                  <p><strong>노트:</strong> {filteredComponents[selectedComponent].notes}</p>
                  {filteredComponents[selectedComponent].dependencies && (
                    <p><strong>의존성:</strong> {filteredComponents[selectedComponent].dependencies.join(', ')}</p>
                  )}
                  {filteredComponents[selectedComponent].dateCollected && (
                    <p><strong>수집일:</strong> {filteredComponents[selectedComponent].dateCollected}</p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">컴포넌트 미리보기</h3>
                  <div className="border border-gray-200 rounded p-4 min-h-[200px] bg-gray-50">
                    <p className="text-gray-500 text-center">
                      컴포넌트가 수집되면 여기에 미리보기가 표시됩니다.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                왼쪽 목록에서 컴포넌트를 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}