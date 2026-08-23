import {
  useMemo,
  useState,
} from 'react'

import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from 'lucide-react'

import './SimilarFootprints.css'

import resolveMediaUrl from '../utils/mediaUrl'
import footprint from '../assets/footprint.png'

function getCandidateTimestamp(
  candidate
) {
  const value =
    candidate.createdAt ||
    candidate.date

  if (!value) {
    return 0
  }

  const timestamp =
    new Date(value).getTime()

  return Number.isNaN(timestamp)
    ? 0
    : timestamp
}

function sortCandidates(
  candidates
) {
  const urgentCandidates =
    candidates
      .filter(
        (candidate) =>
          candidate.requiresAttention
      )
      .sort(
        (
          firstCandidate,
          secondCandidate
        ) =>
          getCandidateTimestamp(
            secondCandidate
          ) -
          getCandidateTimestamp(
            firstCandidate
          )
      )

  const normalCandidates =
    candidates
      .filter(
        (candidate) =>
          !candidate.requiresAttention
      )
      .sort(
        (
          firstCandidate,
          secondCandidate
        ) =>
          getCandidateTimestamp(
            secondCandidate
          ) -
          getCandidateTimestamp(
            firstCandidate
          )
      )

  return [
    ...urgentCandidates,
    ...normalCandidates,
  ]
}

function SimilarFootprints({
  groups = [],
  onBack,
  onPostSelect,
  onCandidateSelect,
}) {
  const [
    expandedGroupIds,
    setExpandedGroupIds,
  ] = useState([])

  const sortedGroups =
    useMemo(
      () =>
        groups.map(
          (group) => ({
            ...group,

            candidates:
              sortCandidates(
                group.candidates ??
                  []
              ),
          })
        ),
      [groups]
    )

  const toggleGroup = (
    missingPostId
  ) => {
    setExpandedGroupIds(
      (previousIds) => {
        if (
          previousIds.includes(
            missingPostId
          )
        ) {
          return previousIds.filter(
            (savedId) =>
              savedId !==
              missingPostId
          )
        }

        return [
          ...previousIds,
          missingPostId,
        ]
      }
    )
  }

  const handleCandidateSelect = (
    missingPostId,
    candidatePostId
  ) => {
    if (onCandidateSelect) {
      onCandidateSelect(
        missingPostId,
        candidatePostId
      )

      return
    }

    onPostSelect?.(
      candidatePostId
    )
  }

  return (
    <div className="similar-footprints-page">
      <div className="similar-footprints-inner">
        <header className="similar-footprints-header">
          <button
            className="similar-footprints-back-button"
            type="button"
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <div className="similar-footprints-title-area">
            <h1>
              <span>
                닮은 발자국
              </span>

              <img
                className="similar-footprints-title-paw"
                src={footprint}
                alt=""
              />
            </h1>

            <p>
              찾고 있는 아이와 닮은
              발견 제보를 모아봤어요.
            </p>
          </div>
        </header>

        <main className="similar-footprints-content">
          {sortedGroups.length === 0 ? (
            <section className="similar-footprints-empty">
              <div className="similar-footprints-empty-icon">
                <img
                  src={footprint}
                  alt=""
                />
              </div>

              <h2>
                아직 닮은 발자국이 없어요
              </h2>

              <p>
                새로운 발견 제보가
                등록되면 이곳에서
                확인할 수 있어요.
              </p>
            </section>
          ) : (
            sortedGroups.map(
              (group) => {
                const isExpanded =
                  expandedGroupIds.includes(
                    group.missingPostId
                  )

                const visibleCandidates =
                  isExpanded
                    ? group.candidates
                    : group.candidates.slice(
                        0,
                        2
                      )

                const hiddenCount =
                  Math.max(
                    0,
                    group.candidates
                      .length - 2
                  )

                return (
                  <section
                    className="similar-footprints-group"
                    key={
                      group.missingPostId
                    }
                  >
                    <div
                      className={`similar-footprints-missing-card ${
                        group.hasNew
                          ? 'has-new-candidate'
                          : ''
                      }`}
                    >
                      <div className="similar-footprints-missing-info">
                        <div className="similar-footprints-group-title-row">
                          <span className="similar-footprints-group-label">
                            내가 찾는 아이
                          </span>

                          {group.hasNew && (
                            <span
                              className="similar-footprints-group-new-badge"
                              aria-label={`새로운 닮은 발자국 ${group.newCount ?? 0}개`}
                            >
                              NEW
                            </span>
                          )}
                        </div>

                        <h2>
                          {group.breed ||
                            '품종 미상'}
                        </h2>

                        <p>
                          {group.location ||
                            '장소 정보 없음'}
                        </p>
                      </div>

                      {group.representativeImage ? (
                        <img
                          src={resolveMediaUrl(
                            group.representativeImage
                          )}
                          alt={`${
                            group.breed ||
                            '찾는 동물'
                          } 사진`}
                        />
                      ) : (
                        <div className="similar-footprints-missing-no-image">
                          <img
                            src={footprint}
                            alt=""
                          />
                        </div>
                      )}
                    </div>

                    <div className="similar-footprints-grid">
                      {visibleCandidates.map(
                        (candidate) => (
                          <article
                            className={`similar-footprints-card ${
                              candidate.requiresAttention
                                ? 'attention-card'
                                : ''
                            }`}
                            key={
                              candidate.postId
                            }
                          >
                            {candidate.requiresAttention && (
                              <span className="similar-footprints-attention">
                                확인 요망
                              </span>
                            )}

                            <button
                              className="similar-footprints-card-click-area"
                              type="button"
                              onClick={() =>
                                handleCandidateSelect(
                                  group.missingPostId,
                                  candidate.postId
                                )
                              }
                              aria-label={`${candidate.breed || '발견 동물'} 제보 확인하기`}
                            >
                              <div className="similar-footprints-card-image-box">
                                {candidate.representativeImage ? (
                                  <img
                                    src={resolveMediaUrl(
                                      candidate.representativeImage
                                    )}
                                    alt={`${
                                      candidate.breed ||
                                      '발견 동물'
                                    } 사진`}
                                  />
                                ) : (
                                  <div className="similar-footprints-no-image">
                                    <img
                                      src={footprint}
                                      alt=""
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="similar-footprints-card-body">
                                <span className="similar-footprints-sighted-label">
                                  봤어요
                                </span>

                                <h3>
                                  {candidate.breed ||
                                    '품종 미상'}
                                </h3>

                                <p className="similar-footprints-location">
                                  {candidate.location ||
                                    '장소 정보 없음'}
                                </p>

                                <p className="similar-footprints-date">
                                  {candidate.date ||
                                    '날짜 정보 없음'}
                                </p>

                                <div className="similar-footprints-detail-row">
                                  <span>
                                    제보 확인하기
                                  </span>

                                  <ChevronRight />
                                </div>
                              </div>
                            </button>
                          </article>
                        )
                      )}
                    </div>

                    {hiddenCount > 0 && (
                      <button
                        className="similar-footprints-more-button"
                        type="button"
                        onClick={() =>
                          toggleGroup(
                            group.missingPostId
                          )
                        }
                      >
                        {isExpanded ? (
                          <>
                            접기
                            <ChevronUp />
                          </>
                        ) : (
                          <>
                            +{hiddenCount}{' '}
                            더보기
                            <ChevronDown />
                          </>
                        )}
                      </button>
                    )}
                  </section>
                )
              }
            )
          )}
        </main>
      </div>
    </div>
  )
}

export default SimilarFootprints