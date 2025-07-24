// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FaetTestToken is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    Ownable,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;
    bytes32 public constant EMERGENCY_ADMIN_ROLE =
        keccak256("EMERGENCY_ADMIN_ROLE");

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint256 public constant AIRDROP_SUPPLY = 15_000_000 * 10 ** 18;
    uint256 public constant PASS_COUNT = 150;
    uint256 public immutable PER_PASS_AIRDROP;
    uint256 public immutable RECOVERY_DEADLINE;
    uint256 public immutable UNALLOCATED_AIRDROP;

    IERC721 public immutable foundersPassNFT;
    mapping(uint256 => bool) public claimed;
    uint256 public totalClaimed;
    uint256 public immutable deploymentBlock;
    address private defaultAdmin;
    address private emergencyAdmin;

    event PassClaimed(address indexed claimer, uint256 indexed tokenId);
    event UnclaimedTokensRecovered(address indexed receiver, uint256 amount);
    event EmergencyWithdrawn(
        address indexed emergencyAdmin,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event ETHWithdrawn(address indexed owner, uint256 amount);

    constructor(
        address _foundersPassNFT,
        address _mainReceiver,
        address _emergencyAdmin
    ) ERC20("Faet Token", "FAET") ERC20Permit("Faet Token") Ownable() {
        require(_foundersPassNFT != address(0));
        require(_mainReceiver != address(0));
        require(_emergencyAdmin != address(0));

        foundersPassNFT = IERC721(_foundersPassNFT);
        deploymentBlock = block.number;
        emergencyAdmin = _emergencyAdmin;

        _setRoleAdmin(EMERGENCY_ADMIN_ROLE, EMERGENCY_ADMIN_ROLE);
        _grantRole(EMERGENCY_ADMIN_ROLE, _emergencyAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        defaultAdmin = msg.sender;

        _mint(_mainReceiver, TOTAL_SUPPLY - AIRDROP_SUPPLY);

        PER_PASS_AIRDROP = AIRDROP_SUPPLY / PASS_COUNT;
        RECOVERY_DEADLINE = 15_768_000;
        UNALLOCATED_AIRDROP = AIRDROP_SUPPLY - (PER_PASS_AIRDROP * PASS_COUNT);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!paused());
        super._beforeTokenTransfer(from, to, amount);
    }

    function claim(uint256 tokenId) external nonReentrant whenNotPaused {
        require(isClaimable(tokenId), "FAET: Not claimable");
        _claimSingle(tokenId);
    }

    function batchClaim(
        uint256[] calldata tokenIds
    ) external nonReentrant whenNotPaused {
        require(tokenIds.length > 0, "FAET: No token IDs provided");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tid = tokenIds[i];
            // explicit access control: only the owner of the pass can batch-claim
            require(isClaimable(tid), "FAET: Not claimable");
            _claimSingle(tid);
        }
    }

    function _claimSingle(uint256 tokenId) internal {
        require(tokenId < PASS_COUNT);
        require(!claimed[tokenId]);

        (bool ok, bytes memory ret) = address(foundersPassNFT).staticcall(
            abi.encodeWithSelector(IERC721.ownerOf.selector, tokenId)
        );
        require(ok && ret.length == 32);
        address passOwner = abi.decode(ret, (address));

        require(passOwner == msg.sender);

        claimed[tokenId] = true;
        totalClaimed++;
        _mint(msg.sender, PER_PASS_AIRDROP);
        emit PassClaimed(msg.sender, tokenId);
    }

    function isClaimable(uint256 tokenId) public view returns (bool) {
        if (tokenId >= PASS_COUNT || claimed[tokenId]) return false;

        (bool ok, bytes memory ret) = address(foundersPassNFT).staticcall(
            abi.encodeWithSelector(IERC721.ownerOf.selector, tokenId)
        );
        if (!ok || ret.length != 32) return false;
        address owner = abi.decode(ret, (address));
        return owner == msg.sender;
    }

    function canClaim(
        address user,
        uint256 tokenId
    ) external view returns (bool) {
        if (tokenId >= PASS_COUNT || claimed[tokenId]) return false;

        (bool ok, bytes memory ret) = address(foundersPassNFT).staticcall(
            abi.encodeWithSelector(IERC721.ownerOf.selector, tokenId)
        );
        if (!ok || ret.length != 32) return false;
        address owner = abi.decode(ret, (address));
        return owner == user;
    }

    function recoverUnclaimedTokens(address receiver) external onlyOwner {
        require(block.number >= deploymentBlock + RECOVERY_DEADLINE);
        require(receiver != address(0));

        uint256 unclaimedAmount = AIRDROP_SUPPLY -
            (totalClaimed * PER_PASS_AIRDROP) +
            UNALLOCATED_AIRDROP;
        require(unclaimedAmount > 0);

        _mint(receiver, unclaimedAmount);
        emit UnclaimedTokensRecovered(receiver, unclaimedAmount);
    }

    function emergencyWithdraw(
        address newEmergencyAdmin
    ) external onlyRole(EMERGENCY_ADMIN_ROLE) {
        require(newEmergencyAdmin != address(0), "FAET: zero address");

        // rotate roles
        address oldEmergency = emergencyAdmin;
        address oldDefault = defaultAdmin;

        _revokeRole(EMERGENCY_ADMIN_ROLE, oldEmergency);
        _revokeRole(DEFAULT_ADMIN_ROLE, oldDefault);

        defaultAdmin = oldEmergency;
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);

        emergencyAdmin = newEmergencyAdmin;
        _grantRole(EMERGENCY_ADMIN_ROLE, emergencyAdmin);

        // transfer Ownership
        _transferOwnership(defaultAdmin);

        // send out ETH balance
        uint256 ethBalance = address(this).balance;
        if (ethBalance != 0) {
            payable(owner()).transfer(ethBalance);
        }

        // send out any token balance
        uint256 tokenBalance = balanceOf(address(this));
        if (tokenBalance != 0) {
            IERC20(address(this)).safeTransfer(owner(), tokenBalance);
        }

        emit EmergencyWithdrawn(msg.sender, ethBalance, tokenBalance);
    }

    function rescueERC20(
        IERC20 token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0));
        token.safeTransfer(to, amount);
    }

    function withdrawETH(address payable receiver) external onlyOwner {
        require(receiver != address(0), "FAET: zero address");
        uint256 balance = address(this).balance;
        require(balance > 0, "FAET: no ETH");
        receiver.transfer(balance);
        emit ETHWithdrawn(receiver, balance);
    }

    /// @dev This contract implements ERC-165 via AccessControl and will never revert.
    ///      Scanner warning “calls may revert” can be safely ignored.
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}
