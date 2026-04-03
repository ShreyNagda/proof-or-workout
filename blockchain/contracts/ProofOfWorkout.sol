// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProofOfWorkout
 * @notice Decentralized fitness verification contract.
 *         Users join a challenge and submit step-count proofs.
 *         The relayer calls submitProof() after OCR verification.
 */
contract ProofOfWorkout {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    address public owner;
    uint256 public constant REWARD_PER_STEP = 1e9; // 1 Gwei per step

    struct Participant {
        bool hasJoined;
        uint256 totalSteps;
        uint256 rewards;       // in wei
        uint256 lastSubmission;
    }

    mapping(address => Participant) private participants;
    address[] private participantList;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event ChallengeJoined(address indexed user);
    event ProofSubmitted(address indexed user, uint256 steps, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 amount);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyJoined() {
        require(participants[msg.sender].hasJoined, "Not enrolled");
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
    }

    // -------------------------------------------------------------------------
    // External / Public functions
    // -------------------------------------------------------------------------

    /// @notice Enroll the caller in the workout challenge.
    function joinChallenge() external {
        require(!participants[msg.sender].hasJoined, "Already joined");
        participants[msg.sender].hasJoined = true;
        participantList.push(msg.sender);
        emit ChallengeJoined(msg.sender);
    }

    /// @notice Submit a verified step count and accrue rewards.
    ///         In production this is called by an authorised relayer.
    /// @param steps  Step count extracted by the OCR relayer.
    function submitProof(uint256 steps) external onlyJoined {
        require(steps >= 100 && steps <= 999999, "Steps out of range");

        uint256 reward = steps * REWARD_PER_STEP;
        participants[msg.sender].totalSteps   += steps;
        participants[msg.sender].rewards      += reward;
        participants[msg.sender].lastSubmission = block.timestamp;

        emit ProofSubmitted(msg.sender, steps, reward);
    }

    /// @notice Returns accrued rewards (in wei) for the caller.
    function getRewards() external view onlyJoined returns (uint256) {
        return participants[msg.sender].rewards;
    }

    /// @notice Check whether an address has joined the challenge.
    function hasJoined(address user) external view returns (bool) {
        return participants[user].hasJoined;
    }

    /// @notice Returns total steps for the caller.
    function getTotalSteps() external view onlyJoined returns (uint256) {
        return participants[msg.sender].totalSteps;
    }

    // -------------------------------------------------------------------------
    // Owner utilities
    // -------------------------------------------------------------------------

    /// @notice Fund contract with ETH to pay out rewards.
    receive() external payable {}

    /// @notice Withdraw contract balance (owner only).
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
