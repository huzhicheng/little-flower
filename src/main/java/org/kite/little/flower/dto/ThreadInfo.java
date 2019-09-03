package org.kite.little.flower.dto;

import lombok.Data;

/**
 * ThreadInfo
 *
 * @author fengzheng
 * @date 2019/8/16
 */
@Data
public class ThreadInfo {

    private int liveThreadCount;

    private int livePeakThreadCount;

    private int daemonThreadCount;

    private long totalStartedThreadCount;


}
