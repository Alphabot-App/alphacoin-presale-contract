// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BoostPrivateSaleUpgradeable is Initializable, OwnableUpgradeable {
    address constant usdt;
    address constant usdc;

    event PrivateSale(address indexed sender, address indexed token, uint256 value);
    event Withdrawn(address indexed token, uint256 value, address indexed recipient);

    function initialize(
        address usdt,
        address usdc
    ) public initializer {
        usdt = usdt;
        usdc = usdc;
        __Ownable_init();
    }

    function privateSaleWithEth() external payable {
        emit PrivateSale(msg.sender, address(0x0), msg.value);
    }

    function privateSaleWithToken(
        address token,
        uint256 amount
    ) external {
        require(token == usdt || token == usdc, "BoostPrivateSaleUpgradeable: Invalid token");
        emit PrivateSale(msg.sender, token, amount);
    }

    function withdraw(
        address token,
        uint256 amount,
        address recipient        
    ) external onlyOwner {
        if(token == address(0x0)) {
            payable(recipient).transfer(amount);
        } else {
            IERC20(token).transfer(recipient, amount);
        }
        emit Withdrawn(token, amount, recipient);
    }
}
