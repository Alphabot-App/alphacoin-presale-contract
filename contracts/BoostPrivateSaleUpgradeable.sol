// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

contract BoostPrivateSaleUpgradeable is Initializable, OwnableUpgradeable {
    IERC20 internal usdt;
    IERC20 internal usdc;
    address internal outAddr;

    event PrivateSale(
        address indexed sender,
        address indexed token,
        uint256 value
    );
    event Withdrawn(
        address indexed token,
        uint256 value,
        address indexed recipient
    );

    function initialize(
        IERC20 _usdt,
        IERC20 _usdc,
        address _outAddr
    ) public initializer {
        usdt = _usdt;
        usdc = _usdc;
        outAddr = _outAddr;

        __Ownable_init(msg.sender);
    }

    function privateSaleWithEth() external payable {
        require(msg.value > 0, "Non zero value");
        (bool success, ) = payable(outAddr).call{value: msg.value}("");
            require(success, "Transfer failed.");
        emit PrivateSale(msg.sender, address(0x0), msg.value);
    }

    function privateSaleWithToken(address token, uint256 amount) external {
        require(
            token == address(usdt) || token == address(usdc),
            "BoostPrivateSaleUpgradeable: Invalid token"
        );
        require(amount > 0, "BoostPrivateSaleUpgradeable: Non zero value");
        IERC20(token).safeTransferFrom(msg.sender, outAddr, amount);
        emit PrivateSale(msg.sender, token, amount);
    }

    function setOutAddress(address newAddr) external onlyOwner {
        outAddr = newAddr;
    }

    // Keeping withdraw function in case for some reason we get some kind of eth or token sent directly to the contract
    function withdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        if (token == address(0x0)) {
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "Transfer failed.");
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
        emit Withdrawn(token, amount, recipient);
    }
}
