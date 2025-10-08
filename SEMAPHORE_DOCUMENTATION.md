# Semaphore V4 Documentation Summary

## Primary Resource
- **Main Documentation**: https://docs.semaphore.pse.dev/llms.txt
- **Official Website**: https://docs.semaphore.pse.dev/

## What is Semaphore?

Semaphore is a zero-knowledge protocol enabling **anonymous group membership and signaling**. It allows users to prove they belong to a group and send messages (votes, endorsements, signals) without revealing their identity, while preventing double-signaling.

---

## Core Technical Components

### 1. Identity Layer

**Purpose**: Cryptographic identity system for privacy-preserving group membership

**Key Concepts**:
- **Identity**: A secret scalar value (private key)
- **Identity Commitment**: Public representation derived from the identity
- **Generation Methods**:
  - Random: Cryptographically random identity
  - Deterministic: Derived from a seed/message for reproducibility

**How it works**:
```
Secret Identity → Hash → Identity Commitment (joins group)
```

The commitment is public and joins groups, while the identity remains private.

---

### 2. Group Management

**Purpose**: Maintain sets of eligible participants using Merkle trees

**Key Concepts**:
- **Merkle Tree**: Data structure storing identity commitments
- **Merkle Proof**: Cryptographic proof of membership in the tree
- **Tree Depth**: Determines maximum group size (depth 1-32 recommended)
  - Depth 32 supports up to 2³² - 1 members

**Operations**:
- Add members (identity commitments)
- Remove members
- Update members
- Generate Merkle root (represents entire group state)
- Generate Merkle proofs (proves membership without revealing position)

**Efficiency**: Log(n) verification complexity

---

### 3. Proof Generation (The Core ZK-SNARK)

**Purpose**: Generate zero-knowledge proofs demonstrating three properties simultaneously

**The Three Properties Proven**:

1. **Membership**: "I am in this group's Merkle tree"
   - Without revealing which leaf/member you are
   - Proven via Merkle proof verification in zero-knowledge

2. **Authorization**: "I know the secret for this nullifier"
   - Proves you have the identity that generated the nullifier
   - Prevents impersonation

3. **Integrity**: "This is my authentic message"
   - Message is cryptographically bound to the proof
   - Cannot be tampered with

**Key Components**:
- **Message**: The signal/vote/data being sent
- **Scope (External Nullifier)**: Limits proof to specific context (e.g., poll ID)
- **Nullifier**: Unique identifier preventing double-signaling
- **Group Merkle Root**: Snapshot of group state

---

## The Nullifier Mechanism (Critical Innovation)

### What is a Nullifier?

```
nullifier = hash(identity, externalNullifier/scope)
```

### Properties:
- **Deterministic**: Same identity + scope → same nullifier every time
- **Public**: Published on-chain/off-chain for duplicate detection
- **Unlinkable**: Different scopes produce uncorrelated nullifiers
- **Unique**: One signal per identity per scope

### How it Prevents Double-Signaling:

1. User generates proof with nullifier
2. System checks if nullifier has been used before
3. If new → accept signal and store nullifier
4. If seen → reject (double-signal attempt detected)

**Critical Security**: The nullifier is public but doesn't reveal identity. However, **never reuse the same identity across different groups** - this breaks anonymity through nullifier correlation attacks.

---

## Technical Architecture

### The Circuit Verifies:

```
┌─────────────────────────────────────┐
│   ZK-SNARK Circuit Verification    │
├─────────────────────────────────────┤
│ 1. Merkle Proof Valid?              │
│    → Proves group membership        │
│                                     │
│ 2. Nullifier Correct?               │
│    → Proves authorization           │
│                                     │
│ 3. Message Integrity?               │
│    → Proves message authenticity    │
└─────────────────────────────────────┘
```

### Security Parameters:
- **Merkle Tree Depth**: 1-32 (recommended range)
- **Proof Validity**: Typically 1 hour
- **Identity Reuse**: NEVER across different groups

---

## Primary Use Cases

1. **Private Voting**
   - Anonymous ballot casting
   - Double-vote prevention
   - Verifiable eligibility

2. **Anonymous Whistleblowing**
   - Verified insider status
   - Protected identity

3. **Decentralized Anonymous Governance**
   - Token-holder votes without exposure
   - Proposal signaling

4. **Privacy-Preserving Authentication**
   - Prove membership without revealing identity
   - Access control

5. **Anonymous Value Transfers**
   - Private transactions with verified authorization

---

## ZK Voting Implementation Workflow

### Setup Phase:
1. **Create Group**: Initialize empty Merkle tree
2. **Register Voters**: Collect identity commitments, add to group
3. **Distribute Identities**: Voters securely store their secret identities

### Voting Phase:
1. **Voter generates identity** (or uses existing)
2. **Get Merkle proof** for their commitment in the group
3. **Generate ZK proof** with:
   - Group Merkle root
   - Vote message (e.g., candidate choice)
   - Scope (poll ID - ensures nullifier is poll-specific)
   - Their secret identity
4. **Submit proof + nullifier + message** to voting system

### Verification Phase:
1. **Verify ZK proof** (checks all three properties)
2. **Check nullifier uniqueness** (hasn't been used for this poll)
3. **Accept vote** if both checks pass
4. **Store nullifier** to prevent future double-voting

---

## Security Properties for Voting

| Property | How Semaphore Achieves It |
|----------|---------------------------|
| **Anonymity** | ZK proof hides which member voted |
| **Eligibility** | Merkle proof ensures only group members can vote |
| **Uniqueness** | Nullifier prevents same identity voting twice |
| **Integrity** | Message cryptographically bound to proof |
| **Verifiability** | Anyone can verify proof validity |
| **No Authority Needed** | Cryptographic enforcement, not trusted party |

---

## Key NPM Packages

```json
{
  "@semaphore-protocol/core": "Core utilities and types",
  "@semaphore-protocol/identity": "Identity generation and management",
  "@semaphore-protocol/group": "Group/Merkle tree operations",
  "@semaphore-protocol/proof": "Proof generation and verification",
  "@semaphore-protocol/contracts": "Smart contracts for on-chain verification"
}
```

---

## Critical Security Considerations

### ⚠️ NEVER DO THIS:
```javascript
// WRONG: Reusing identity across groups
const identity = new Identity()
group1.addMember(identity.commitment)
group2.addMember(identity.commitment) // ❌ COMPROMISES ANONYMITY
```

### ✅ DO THIS INSTEAD:
```javascript
// CORRECT: One identity per group
const identity1 = new Identity()
const identity2 = new Identity()
group1.addMember(identity1.commitment)
group2.addMember(identity2.commitment) // ✅ SAFE
```

**Why?** Nullifiers from the same identity can be correlated across groups, linking activities and breaking anonymity.

---

## Advanced Concepts

### Scope (External Nullifier)
- Binds proof to specific context
- Same identity can signal once per scope
- Examples:
  - Poll ID: `hash("poll-2024-election")`
  - Event ID: `hash("event-12345")`
  - Action type: `hash("upvote-post-789")`

### Merkle Tree Depth Selection
- **Depth 10**: Up to 1,024 members
- **Depth 16**: Up to 65,536 members
- **Depth 20**: Up to 1,048,576 members
- **Depth 32**: Up to 4,294,967,295 members

**Trade-off**: Larger depth → more members but slower proof generation

### Proof Composition
```
Proof = {
  merkleTreeDepth,
  merkleTreeRoot,
  nullifier,
  message,
  scope,
  points (ZK-SNARK proof data)
}
```

---

## The Math Behind It (Simplified)

### Identity Commitment
```
commitment = poseidon([identity])
```

### Nullifier Generation
```
nullifier = poseidon([scope, identity])
```

### Merkle Tree
```
root = hash(hash(leaf1, leaf2), hash(leaf3, leaf4))
```

### ZK Proof
Proves knowledge of:
- Secret `identity`
- Such that `poseidon([identity])` is in Merkle tree
- And `poseidon([scope, identity]) = nullifier`
- Without revealing `identity`

---

## Resources & Links

- **Documentation**: https://docs.semaphore.pse.dev/
- **LLM-Optimized Docs**: https://docs.semaphore.pse.dev/llms.txt
- **GitHub**: https://github.com/semaphore-protocol/semaphore
- **NPM**: @semaphore-protocol/* packages

---

## Quick Reference: Key Terms

| Term | Definition |
|------|------------|
| **Identity** | Secret scalar value (like a private key) |
| **Commitment** | Public representation of identity |
| **Group** | Merkle tree of identity commitments |
| **Nullifier** | Unique public identifier per identity per scope |
| **Scope** | Context binding (e.g., poll ID) |
| **Proof** | ZK-SNARK demonstrating membership + authorization + integrity |
| **Signal/Message** | The anonymous data being sent (vote, endorsement, etc.) |

---

## Why This Matters for ZK Voting

Semaphore solves the **fundamental trilemma of anonymous voting**:

1. ✅ **Verifiable Eligibility**: Only registered voters can vote (Merkle proof)
2. ✅ **Complete Anonymity**: No one knows who voted for what (ZK proof)
3. ✅ **No Double Voting**: Each voter can only vote once (nullifier)

Traditional systems can only achieve 2 of 3. Semaphore achieves all 3 through zero-knowledge cryptography.

---

*Last Updated: 2025-10-07*
