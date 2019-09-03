package org.kite.little.flower.controller;

import org.kite.little.flower.dto.Vm;
import org.kite.little.flower.service.VmService;
import org.kite.little.flower.utils.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * VmController
 *
 * @author fengzheng
 * @date 2019/8/27
 */
@RestController
@RequestMapping(value = "vm")
public class VmController {

    @Autowired
    private VmService vmService;

    @GetMapping(value = "localJvms")
    public Result<List<Vm>> getLocalJvmProcessList(){
        try {
            List<Vm> jvms = vmService.getLocalJvm();
            return Result.success(jvms);
        }catch (Exception e){
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping(value = "attachLocalJvm")
    public Result<Boolean> attachLocalJvm(Integer pid){
        try {
            vmService.attachJvm(pid);
            return Result.success();
        }catch (Exception e){
            e.printStackTrace();
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping(value = "attachRemoteJvm")
    public Result<Boolean> attachRemoteJvm(String host,String port){
        try {
            vmService.attachRemoteJvm(host,port);
            return Result.success();
        }catch (Exception e){
            e.printStackTrace();
            return Result.fail(e.getMessage());
        }
    }
}
