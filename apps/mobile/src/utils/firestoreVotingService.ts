import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface VoteData {
  resourceId: string;
  sessionId: string;
  ipAddress: string;
  vote: 'up' | 'down';
  createdAt: Date;
}

export interface VoteStats {
  thumbsUp: number;
  thumbsDown: number;
}

/**
 * Get vote statistics for a resource
 */
export async function getVoteStats(resourceId: string): Promise<VoteStats> {
  try {
    const votesRef = collection(db, 'votes');
    const resourceQuery = query(votesRef, where('resourceId', '==', resourceId));
    const snapshot = await getDocs(resourceQuery);
    
    let thumbsUp = 0;
    let thumbsDown = 0;
    
    snapshot.forEach((doc) => {
      const vote = doc.data().vote;
      if (vote === 'up') {
        thumbsUp++;
      } else if (vote === 'down') {
        thumbsDown++;
      }
    });
    
    return { thumbsUp, thumbsDown };
  } catch (error) {
    console.error('Error getting vote stats:', error);
    return { thumbsUp: 0, thumbsDown: 0 };
  }
}

/**
 * Get user's vote for a specific resource
 */
export async function getUserVote(resourceId: string, sessionId: string, ipAddress: string): Promise<'up' | 'down' | null> {
  try {
    const voteId = `${resourceId}_${sessionId}_${ipAddress}`;
    const voteDoc = doc(db, 'votes', voteId);
    const snapshot = await getDoc(voteDoc);
    
    if (snapshot.exists()) {
      return snapshot.data().vote;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
}

/**
 * Submit a vote for a resource
 */
export async function submitVote(resourceId: string, sessionId: string, ipAddress: string, vote: 'up' | 'down'): Promise<void> {
  try {
    const voteId = `${resourceId}_${sessionId}_${ipAddress}`;
    const voteDoc = doc(db, 'votes', voteId);
    
    const voteData: VoteData = {
      resourceId,
      sessionId,
      ipAddress,
      vote,
      createdAt: new Date()
    };
    
    await setDoc(voteDoc, voteData);
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

/**
 * Remove a vote for a resource
 */
export async function removeVote(resourceId: string, sessionId: string, ipAddress: string): Promise<void> {
  try {
    const voteId = `${resourceId}_${sessionId}_${ipAddress}`;
    const voteDoc = doc(db, 'votes', voteId);
    await deleteDoc(voteDoc);
  } catch (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
}

/**
 * Get vote stats and user vote in a single call for efficiency
 */
export async function getVoteStatsWithUserVote(resourceId: string, sessionId: string, ipAddress: string): Promise<{
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
}> {
  try {
    const [stats, userVote] = await Promise.all([
      getVoteStats(resourceId),
      getUserVote(resourceId, sessionId, ipAddress)
    ]);
    
    return {
      ...stats,
      userVote
    };
  } catch (error) {
    console.error('Error getting vote stats with user vote:', error);
    return {
      thumbsUp: 0,
      thumbsDown: 0,
      userVote: null
    };
  }
}